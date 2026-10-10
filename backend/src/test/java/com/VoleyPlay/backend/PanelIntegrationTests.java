package com.VoleyPlay.backend;

import com.VoleyPlay.backend.repository.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import tools.jackson.databind.*;
import java.net.*;
import java.net.http.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties={"app.registration.mode=invite","app.registration.code=Invitacion-test-2026!"})
@ActiveProfiles("test")
class PanelIntegrationTests {
    @Value("${local.server.port}") int port;
    @Autowired PagoRepository pagos;
    @Autowired ReservaRepository reservas;
    @Autowired HorarioRepository horarios;
    @Autowired ClienteRepository clientes;
    @Autowired CanchaRepository canchas;
    @Autowired UsuarioRepository usuarios;
    final ObjectMapper json = new ObjectMapper();
    HttpClient client;
    String fecha;

    @BeforeEach void iniciar() throws Exception {
        pagos.deleteAll(); reservas.deleteAll(); horarios.deleteAll(); clientes.deleteAll(); canchas.deleteAll();
        usuarios.deleteAll();
        client=HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
                .version(HttpClient.Version.HTTP_1_1).connectTimeout(Duration.ofSeconds(10)).build();
        fecha=LocalDate.now(ZoneId.of("America/Lima")).plusDays(1).toString();
        assertEquals(204, login("Test-voleyplay-2026!").statusCode());
    }
    HttpResponse<String> raw(String method, String path, String body, String contentType, JsonNode csrf) throws Exception {
        var builder=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api"+path)).timeout(Duration.ofSeconds(15));
        if (csrf!=null) builder.header(csrf.get("headerName").asText(),csrf.get("token").asText());
        if(contentType!=null) builder.header("Content-Type",contentType);
        return client.send(builder.method(method,body==null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body)).build(),HttpResponse.BodyHandlers.ofString());
    }
    HttpResponse<String> call(String method,String path,Object data) throws Exception {
        JsonNode csrf=method.equals("GET") ? null : json.readTree(raw("GET","/auth/csrf",null,null,null).body());
        return raw(method,path,data==null ? null : json.writeValueAsString(data),data==null ? null : "application/json",csrf);
    }
    HttpResponse<String> login(String password) throws Exception {
        JsonNode csrf=json.readTree(raw("GET","/auth/csrf",null,null,null).body());
        return raw("POST","/auth/login","username=admin&password="+URLEncoder.encode(password,java.nio.charset.StandardCharsets.UTF_8),"application/x-www-form-urlencoded",csrf);
    }
    long crear(String path, Object data) throws Exception {
        var response=call("POST",path,data); assertEquals(200,response.statusCode(),response.body());
        return json.readTree(response.body()).get("id").asLong();
    }
    Map<String,Object> cliente(String dni) { return Map.of("nombre","Ana","apellido","Prueba","dni",dni,"telefono","999888777","email","ana@example.test"); }
    Map<String,Object> cancha(int numero, String estado) { return Map.of("numero",numero,"nombre","Cancha de prueba","tipoSuperficie","Arena","estado",estado); }
    Map<String,Object> horario(String inicio,String fin,double precio) { return Map.of("horaInicio",inicio,"horaFin",fin,"precio",precio,"estado","Disponible"); }
    Map<String,Object> reserva(long cliente,long cancha,long horario,String fecha,String estado) {
        return Map.of("idCliente",cliente,"idCancha",cancha,"idHorario",horario,"fechaReserva",fecha,"estado",estado,"total",99999);
    }
    Map<String,Object> pago(long reserva,double monto,String estado) {
        return Map.of("idReserva",reserva,"monto",monto,"fechaPago",LocalDate.now(ZoneId.of("America/Lima")).toString(),"metodoPago","Yape","estado",estado);
    }

    @Test void registroPersistenteValidaInvitacionCsrfYLogin() throws Exception {
        assertEquals(204,call("POST","/auth/logout",null).statusCode());
        var data=Map.of("username","Nuevo.Usuario","password","Nueva-clave-2026!","invitationCode","Invitacion-test-2026!");
        assertEquals(403,raw("POST","/auth/register",json.writeValueAsString(data),"application/json",null).statusCode());
        var invalid=new HashMap<>(data);invalid.put("invitationCode","incorrecto");
        assertEquals(403,call("POST","/auth/register",invalid).statusCode());
        invalid=new HashMap<>(data);invalid.put("password","corta");
        assertEquals(400,call("POST","/auth/register",invalid).statusCode());
        invalid=new HashMap<>(data);invalid.put("password","á".repeat(40));
        assertEquals(400,call("POST","/auth/register",invalid).statusCode());
        invalid=new HashMap<>(data);invalid.put("username","admin");
        assertEquals(409,call("POST","/auth/register",invalid).statusCode());
        var response=call("POST","/auth/register",data);
        assertEquals(201,response.statusCode(),response.body());
        assertFalse(response.body().contains("password"));
        assertEquals(409,call("POST","/auth/register",data).statusCode());
        assertEquals(401,call("GET","/cliente",null).statusCode());
        var stored=usuarios.findByUsername("nuevo.usuario").orElseThrow();
        assertTrue(stored.getPasswordHash().startsWith("{bcrypt}"));
        assertNotEquals(data.get("password"),stored.getPasswordHash());
        client=HttpClient.newBuilder().cookieHandler(new CookieManager(null,CookiePolicy.ACCEPT_ALL)).build();
        JsonNode csrf=json.readTree(call("GET","/auth/csrf",null).body());
        assertEquals(204,raw("POST","/auth/login","username=NUEVO.USUARIO&password=Nueva-clave-2026!","application/x-www-form-urlencoded",csrf).statusCode());
        assertEquals("nuevo.usuario",json.readTree(call("GET","/auth/me",null).body()).get("username").asText());
        assertEquals(200,call("GET","/cliente",null).statusCode());
        assertEquals(204,call("POST","/auth/logout",null).statusCode());
        assertEquals(401,call("GET","/cliente",null).statusCode());
    }

    @Test void registroAbiertoCreaCuentaSinInvitacion() {
        var service=new com.VoleyPlay.backend.services.RegistroService(usuarios,"admin","open","");
        assertEquals(true,service.configuration().get("enabled"));
        assertEquals(false,service.configuration().get("invitationRequired"));
        assertEquals("cuenta.abierta",service.register(new com.VoleyPlay.backend.services.RegistroService.Registro("Cuenta.Abierta","Nueva-clave-2026!",null)));
        assertTrue(usuarios.findByUsername("cuenta.abierta").isPresent());
    }

    @Test void registroDeshabilitadoNoCreaUsuarios() {
        var service=new com.VoleyPlay.backend.services.RegistroService(usuarios,"admin","disabled","");
        assertEquals(false,service.configuration().get("enabled"));
        var failure=assertThrows(org.springframework.web.server.ResponseStatusException.class,()->service.register(
            new com.VoleyPlay.backend.services.RegistroService.Registro("nuevo.usuario","Nueva-clave-2026!",null)));
        assertEquals(503,failure.getStatusCode().value());
        assertEquals(0,usuarios.count());
    }

    @Test void clientesAdmitenOpcionalesVaciosYRechazanCorreoDuplicado() throws Exception {
        var empty=new HashMap<>(cliente(""));
        empty.put("email", "");
        long first=crear("/cliente", empty);
        crear("/cliente", empty);
        assertTrue(json.readTree(call("GET", "/cliente/"+first, null).body()).get("email").isNull());
        crear("/cliente", cliente("12345678"));
        assertEquals(409,call("POST", "/cliente", cliente("87654321")).statusCode());
    }

    @Test void permiteEditarValoresExistentesEnProduccion() throws Exception {
        var court = new HashMap<>(cancha(1,"Disponible"));
        court.put("tipoSuperficie", "Grass Sintetico");
        long id = crear("/cancha", court);
        assertEquals("Grass Sintético", json.readTree(call("GET", "/cancha/"+id, null).body()).get("tipoSuperficie").asText());
        for (String state : List.of("En proceso", "Reservado")) {
            var slot = new HashMap<>(horario("08:00", "09:00", 50));
            long slotId = crear("/horario", slot);
            slot.put("estado", state);
            slot.put("precio", 60);
            assertEquals(200, call("PUT", "/horario/"+slotId, slot).statusCode());
            assertEquals(state, json.readTree(call("GET", "/horario/"+slotId, null).body()).get("estado").asText());
            assertEquals(200, call("DELETE", "/horario/"+slotId, null).statusCode());
        }
    }

    @Test void flujoCompletoCrudConRestriccionesYLogout() throws Exception {
        long c=crear("/cliente",cliente("12345678")), cancha=crear("/cancha",cancha(1,"Disponible")), h=crear("/horario",horario("08:00","09:00",50));
        assertEquals(200,call("PUT","/cliente/"+c,cliente("87654321")).statusCode());
        assertEquals(200,call("PUT","/cancha/"+cancha,cancha(2,"Disponible")).statusCode());
        var nuevaReserva=new HashMap<>(reserva(c,cancha,h,fecha,"Pendiente"));
        nuevaReserva.remove("total");
        long r=crear("/reserva",nuevaReserva);
        assertEquals(50,json.readTree(call("GET","/reserva/"+r,null).body()).get("total").asDouble());
        assertEquals(200,call("PUT","/reserva/"+r,reserva(c,cancha,h,fecha,"Confirmada")).statusCode());
        assertEquals(409,call("DELETE","/cliente/"+c,null).statusCode());
        assertEquals(409,call("DELETE","/cancha/"+cancha,null).statusCode());
        assertEquals(409,call("DELETE","/horario/"+h,null).statusCode());
        assertEquals(409,call("PUT","/horario/"+h,horario("10:00","11:00",50)).statusCode());
        assertEquals(200,call("PUT","/horario/"+h,horario("08:00","09:00",60)).statusCode());
        assertEquals(200,call("PUT","/reserva/"+r,reserva(c,cancha,h,fecha,"Confirmada")).statusCode());
        assertEquals(50,json.readTree(call("GET","/reserva/"+r,null).body()).get("total").asDouble());
        long p=crear("/pago",pago(r,30,"Pagado"));
        assertEquals(409,call("POST","/pago",pago(r,21,"Pagado")).statusCode());
        assertEquals(409,call("PUT","/reserva/"+r,reserva(c,cancha,h,fecha,"Cancelada")).statusCode());
        assertEquals(409,call("DELETE","/reserva/"+r,null).statusCode());
        assertEquals(200,call("PUT","/pago/"+p,pago(r,30,"Cancelado")).statusCode());
        assertEquals(200,call("PUT","/reserva/"+r,reserva(c,cancha,h,fecha,"Cancelada")).statusCode());
        assertEquals(200,call("DELETE","/pago/"+p,null).statusCode());
        assertEquals(200,call("DELETE","/reserva/"+r,null).statusCode());
        for(String path:List.of("/cliente/"+c,"/horario/"+h,"/cancha/"+cancha)) assertEquals(200,call("DELETE",path,null).statusCode());
        assertEquals(404,call("GET","/reserva/"+r,null).statusCode());
        assertEquals(204,call("POST","/auth/logout",null).statusCode());
        assertEquals(401,call("GET","/cliente",null).statusCode());
        assertEquals(401,login("incorrecta").statusCode());
    }
    @Test void disponibilidadPorFechaIntervaloCancelacionYCancha() throws Exception {
        long c=crear("/cliente",cliente("12345678")), court=crear("/cancha",cancha(1,"Disponible"));
        long h=crear("/horario",horario("08:00","09:00",50)), overlap=crear("/horario",horario("08:30","09:30",50));
        long r=crear("/reserva",reserva(c,court,h,fecha,"Confirmada"));
        assertEquals(409,call("POST","/reserva",reserva(c,court,overlap,fecha,"Pendiente")).statusCode());
        crear("/reserva",reserva(c,court,h,LocalDate.parse(fecha).plusDays(1).toString(),"Confirmada"));
        assertEquals(200,call("PUT","/reserva/"+r,reserva(c,court,h,fecha,"Cancelada")).statusCode());
        crear("/reserva",reserva(c,court,overlap,fecha,"Confirmada"));
        assertEquals(409,call("PUT","/reserva/"+r,reserva(c,court,h,fecha,"Confirmada")).statusCode());
        assertEquals(200,call("PUT","/cancha/"+court,cancha(1,"Mantenimiento")).statusCode());
        assertEquals(409,call("POST","/reserva",reserva(c,court,h,LocalDate.parse(fecha).plusDays(2).toString(),"Pendiente")).statusCode());
    }
    @Test void validaDuplicadosDatosInvalidosYReferencias() throws Exception {
        long c=crear("/cliente",cliente("12345678")), court=crear("/cancha",cancha(1,"Disponible")), h=crear("/horario",horario("08:00","09:00",50));
        assertEquals(409,call("POST","/cliente",cliente("12345678")).statusCode());
        assertEquals(400,call("POST","/cliente",cliente("123")).statusCode());
        assertEquals(409,call("POST","/cancha",cancha(1,"Disponible")).statusCode());
        assertEquals(400,call("POST","/cancha",cancha(-1,"Disponible")).statusCode());
        assertEquals(400,call("POST","/horario",horario("09:00","09:00",50)).statusCode());
        assertEquals(400,call("POST","/horario",horario("10:00","11:00",-1)).statusCode());
        assertEquals(404,call("POST","/reserva",reserva(999,court,h,fecha,"Pendiente")).statusCode());
        assertEquals(400,call("POST","/reserva",reserva(c,court,h,"2020-01-01","Pendiente")).statusCode());
        long madrugada=crear("/horario",horario("00:00","01:00",50));
        assertEquals(400,call("POST","/reserva",reserva(c,court,madrugada,LocalDate.now(ZoneId.of("America/Lima")).toString(),"Pendiente")).statusCode());
        long r=crear("/reserva",reserva(c,court,h,fecha,"Pendiente"));
        assertEquals(400,call("POST","/pago",pago(r,-1,"Pagado")).statusCode());
        assertEquals(400,call("POST","/pago",pago(r,10.123,"Pagado")).statusCode());
        assertEquals(404,call("POST","/pago",pago(999,10,"Pagado")).statusCode());
        assertEquals(404,call("PUT","/cliente/999",cliente("11111111")).statusCode());
        assertEquals(400,call("POST","/reserva",Map.of("fechaReserva","incorrecta")).statusCode());
    }
    @Test void turnosNocturnosBloqueanSolapamientosEntreDias() throws Exception {
        long c=crear("/cliente",cliente("12345678")), court=crear("/cancha",cancha(1,"Disponible"));
        long noche=crear("/horario",horario("23:00","01:00",50));
        long madrugada=crear("/horario",horario("00:30","01:00",50));
        long siguiente=crear("/horario",horario("01:00","02:00",50));
        String manana=LocalDate.parse(fecha).plusDays(1).toString();
        long r=crear("/reserva",reserva(c,court,noche,fecha,"Confirmada"));
        assertEquals(409,call("POST","/reserva",reserva(c,court,madrugada,manana,"Pendiente")).statusCode());
        crear("/reserva",reserva(c,court,madrugada,fecha,"Pendiente"));
        crear("/reserva",reserva(c,court,siguiente,manana,"Pendiente"));
        assertEquals(200,call("PUT","/reserva/"+r,reserva(c,court,noche,fecha,"Cancelada")).statusCode());
        crear("/reserva",reserva(c,court,madrugada,manana,"Pendiente"));
    }

    @Test void bloqueaEscriturasSinCsrfYCorsSoloPermiteOrigenConfigurado() throws Exception {
        assertEquals(403,raw("POST","/cliente",json.writeValueAsString(cliente("12345678")),"application/json",null).statusCode());
        var allowed=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/cliente")).method("OPTIONS",HttpRequest.BodyPublishers.noBody())
                .header("Origin","http://localhost:5173").header("Access-Control-Request-Method","POST").build();
        var response=client.send(allowed,HttpResponse.BodyHandlers.ofString());
        assertEquals("http://localhost:5173",response.headers().firstValue("Access-Control-Allow-Origin").orElse(""));
        var denied=HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/cliente")).method("OPTIONS",HttpRequest.BodyPublishers.noBody())
                .header("Origin","https://example.test").header("Access-Control-Request-Method","POST").build();
        assertEquals(403,client.send(denied,HttpResponse.BodyHandlers.ofString()).statusCode());
    }
    @Test void reservasSimultaneasNoDuplicanElTurno() throws Exception {
        long c=crear("/cliente",cliente("12345678")), court=crear("/cancha",cancha(1,"Disponible")), h=crear("/horario",horario("08:00","09:00",50));
        var turn=reserva(c,court,h,fecha,"Confirmada");
        try(var executor=Executors.newFixedThreadPool(2)) {
            var latch=new CountDownLatch(1);
            Callable<Integer> write=()->{latch.await();return call("POST","/reserva",turn).statusCode();};
            var first=executor.submit(write);var second=executor.submit(write);latch.countDown();
            var statuses=new ArrayList<>(List.of(first.get(),second.get()));Collections.sort(statuses);
            assertEquals(List.of(200,409),statuses); assertEquals(1,reservas.count());
        }
    }
    @Test void pagosSimultaneosNoSuperanElSaldo() throws Exception {
        long c=crear("/cliente",cliente("12345678")), court=crear("/cancha",cancha(1,"Disponible")), h=crear("/horario",horario("08:00","09:00",50));
        long r=crear("/reserva",reserva(c,court,h,fecha,"Confirmada"));
        try(var executor=Executors.newFixedThreadPool(2)) {
            var latch=new CountDownLatch(1);
            Callable<Integer> write=()->{latch.await();return call("POST","/pago",pago(r,30,"Pagado")).statusCode();};
            var first=executor.submit(write);var second=executor.submit(write);latch.countDown();
            var statuses=new ArrayList<>(List.of(first.get(),second.get()));Collections.sort(statuses);
            assertEquals(List.of(200,409),statuses); assertEquals(1,pagos.count());
        }
    }
}
