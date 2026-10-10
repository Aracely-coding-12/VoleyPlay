package com.VoleyPlay.backend.controller;



import com.VoleyPlay.backend.model.*;

import com.VoleyPlay.backend.services.*;

import java.time.*;

import java.text.Normalizer;

import java.util.*;

import java.security.Principal;

import org.springframework.beans.BeanWrapperImpl;

import org.springframework.stereotype.Controller;

import org.springframework.ui.Model;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.server.ResponseStatusException;

import org.springframework.web.servlet.mvc.support.RedirectAttributes;



@Controller

public class WebController {
    @org.springframework.beans.factory.annotation.Autowired
    private jakarta.servlet.http.HttpServletRequest request;
    @SuppressWarnings("unchecked")
    private <T> List<T> cached(String key,java.util.function.Supplier<List<T>> loader) {
        String attribute="panel."+key;
        var value=request.getAttribute(attribute);
        if(value==null) {value=loader.get();request.setAttribute(attribute,value);}
        return (List<T>)value;
    }

    private final ClienteService clientes;

    private final CanchaService canchas;

    private final HorarioService horarios;

    private final ReservaService reservas;

    private final PagoService pagos;

    private final RegistroService registro;

    public WebController(ClienteService clientes,CanchaService canchas,HorarioService horarios,ReservaService reservas,PagoService pagos,RegistroService registro) {

        this.clientes=clientes;this.canchas=canchas;this.horarios=horarios;this.reservas=reservas;this.pagos=pagos;this.registro=registro;

    }

    public record Option(String value,String label) {}

    public record Field(String name,String label,String type,boolean required,List<Option> options) {}

    public record Row(Long id,List<String> values) {}

    public record Cell(String state,String link) {}

    public record Slot(String label,List<Cell> cells) {}

    public record Stat(String label,String value) {}

    private Field input(String name,String label,String type,boolean required) {return new Field(name,label,type,required,List.of());}

    private Field select(String name,String label,String... values) {return new Field(name,label,"select",true,Arrays.stream(values).map(v->new Option(v,v)).toList());}

    private String money(double value) {return String.format(Locale.US,"S/ %.2f",value);}

    private String turno(Horario h) {return h.getHoraInicio()+" – "+h.getHoraFin()+(h.getHoraFin().isBefore(h.getHoraInicio())?" (+1 día)":"");}

    private String client(Long id) {return cached("clientes",clientes::listar).stream().filter(c->c.getId().equals(id)).map(c->c.getNombre()+" "+c.getApellido()).findFirst().orElse("Cliente #"+id);}

    private String court(Long id) {return cached("canchas",canchas::listar).stream().filter(c->c.getId().equals(id)).map(Cancha::getNombre).findFirst().orElse("Cancha #"+id);}

    private String slot(Long id) {return cached("horarios",horarios::listar).stream().filter(h->h.getId().equals(id)).map(this::turno).findFirst().orElse("Horario #"+id);}

    private double paid(Long id) {return cached("pagos",pagos::listar).stream().filter(p->p.getIdReserva().equals(id)&&"Pagado".equalsIgnoreCase(p.getEstado())).mapToDouble(Pago::getMonto).sum();}

    private String text(Object value) {return value==null?"":value.toString();}

    private String normalized(String value) {return Normalizer.normalize(value,Normalizer.Form.NFD).replaceAll("\\p{M}","").toLowerCase(Locale.ROOT);}

    @ModelAttribute void common(Model model,Principal principal) {model.addAttribute("username",principal==null?"":principal.getName());}

    @GetMapping("/") String home() {return "redirect:/panel";}

    @GetMapping("/login") String login() {return "login";}

    @GetMapping("/registro") String register(Model model) {model.addAllAttributes(registro.configuration());return "registro";}

    @PostMapping("/registro") String registerPost(@RequestParam String username,@RequestParam String password,@RequestParam String confirmation,@RequestParam(defaultValue="") String invitationCode,Model model,RedirectAttributes redirect) {

        try {

            if(!password.equals(confirmation)) throw new IllegalArgumentException("Las contraseñas no coinciden.");

            registro.register(new RegistroService.Registro(username,password,invitationCode));

            redirect.addFlashAttribute("notice","Cuenta creada. Ya puedes iniciar sesión.");return "redirect:/login";

        } catch(ResponseStatusException|IllegalArgumentException ex) {model.addAttribute("error",message(ex));model.addAttribute("newUsername",username);return register(model);}

    }

    @GetMapping("/panel") String dashboard(Model model) {

        LocalDate today=LocalDate.now(ZoneId.of("America/Lima"));

        double income=cached("pagos",pagos::listar).stream().filter(p->"Pagado".equalsIgnoreCase(p.getEstado())&&p.getFechaPago()!=null&&YearMonth.from(p.getFechaPago()).equals(YearMonth.from(today))).mapToDouble(Pago::getMonto).sum();

        model.addAttribute("stats",List.of(new Stat("Clientes",text(cached("clientes",clientes::listar).size())),new Stat("Canchas disponibles",text(cached("canchas",canchas::listar).stream().filter(c->"Disponible".equalsIgnoreCase(c.getEstado())).count())),new Stat("Reservas del mes",text(cached("reservas",reservas::listar).stream().filter(r->!"Cancelada".equalsIgnoreCase(r.getEstado())&&YearMonth.from(r.getFechaReserva()).equals(YearMonth.from(today))).count())),new Stat("Cobros del mes",money(income))));

        model.addAttribute("upcoming",cached("reservas",reservas::listar).stream().filter(r->!"Cancelada".equalsIgnoreCase(r.getEstado())&&start(r).isAfter(LocalDateTime.now(ZoneId.of("America/Lima")))).sorted(Comparator.comparing(this::start)).limit(6).map(r->row("reservas",r)).toList());

        model.addAttribute("active","inicio");return "dashboard";

    }

    private Horario schedule(Long id) {return cached("horarios",horarios::listar).stream().filter(h->h.getId().equals(id)).findFirst().orElseThrow(()->new IllegalArgumentException("Horario no encontrado."));}
    private LocalDateTime start(Reserva r) {return r.getFechaReserva().atTime(schedule(r.getIdHorario()).getHoraInicio());}

    private LocalDateTime end(LocalDate date,Horario h) {return (h.getHoraFin().isBefore(h.getHoraInicio())?date.plusDays(1):date).atTime(h.getHoraFin());}

    private List<?> list(String kind) {return switch(kind) {case "clientes"->cached("clientes",clientes::listar);case "canchas"->cached("canchas",canchas::listar);case "horarios"->cached("horarios",horarios::listar);case "reservas"->cached("reservas",reservas::listar);case "pagos"->cached("pagos",pagos::listar);default->throw new IllegalArgumentException("Sección desconocida.");};}

    private Object find(String kind,long id) {return switch(kind) {case "clientes"->clientes.buscarPorId(id);case "canchas"->canchas.buscarPorId(id);case "horarios"->horarios.buscarPorId(id);case "reservas"->reservas.buscarPorId(id);case "pagos"->pagos.buscarPorId(id);default->throw new IllegalArgumentException("Sección desconocida.");};}

    private List<Field> fields(String kind) {

        return switch(kind) {

            case "clientes"->List.of(input("nombre","Nombre","text",true),input("apellido","Apellido","text",true),input("dni","DNI (opcional)","text",false),input("telefono","Teléfono","tel",false),input("email","Correo","email",false));

            case "canchas"->List.of(input("numero","Número","number",true),input("nombre","Nombre","text",true),select("tipoSuperficie","Superficie","Arena","Cemento","Losa","Sintético","Grass Sintético"),select("estado","Estado","Disponible","Ocupada","Mantenimiento"));

            case "horarios"->List.of(input("horaInicio","Hora de inicio","time",true),input("horaFin","Hora de fin","time",true),input("precio","Precio del turno","number",true),select("estado","Estado","Disponible","Inactivo","Ocupado","En proceso","Reservado"));

            case "reservas"->List.of(new Field("idCliente","Cliente","select",true,cached("clientes",clientes::listar).stream().map(c->new Option(text(c.getId()),c.getNombre()+" "+c.getApellido())).toList()),new Field("idCancha","Cancha","select",true,cached("canchas",canchas::listar).stream().map(c->new Option(text(c.getId()),c.getNombre()+" · "+c.getEstado())).toList()),new Field("idHorario","Horario y precio","select",true,cached("horarios",horarios::listar).stream().map(h->new Option(text(h.getId()),turno(h)+" · "+money(h.getPrecio())+" · "+h.getEstado())).toList()),input("fechaReserva","Fecha","date",true),select("estado","Estado","Pendiente","Confirmada","Cancelada"));

            case "pagos"->List.of(new Field("idReserva","Reserva y saldo","select",true,cached("reservas",reservas::listar).stream().map(r->new Option(text(r.getId()),"#"+r.getId()+" · "+client(r.getIdCliente())+" · "+r.getFechaReserva()+" · saldo "+money(r.getTotal()-paid(r.getId())))).toList()),input("fechaPago","Fecha de pago","date",true),input("monto","Monto","number",true),select("metodoPago","Método","Efectivo","Yape","Plin","Tarjeta"),select("estado","Estado","Pagado","Pendiente","Cancelado"));

            default->throw new IllegalArgumentException("Sección desconocida.");

        };

    }

    private List<String> headings(String kind) {return switch(kind) {case "clientes"->List.of("Nombre","Apellido","DNI","Teléfono","Correo");case "canchas"->List.of("Número","Nombre","Superficie","Estado");case "horarios"->List.of("Turno","Precio","Estado");case "reservas"->List.of("Cliente","Cancha","Fecha","Turno","Total","Estado");case "pagos"->List.of("Reserva / Cliente","Fecha","Monto","Método","Estado");default->List.of();};}

    private Row row(String kind,Object entity) {

        BeanWrapperImpl bean=new BeanWrapperImpl(entity);Long id=(Long)bean.getPropertyValue("id");

        List<String> values;

        if(entity instanceof Horario h) values=List.of(turno(h),money(h.getPrecio()),text(h.getEstado()));

        else if(entity instanceof Reserva r) values=List.of(client(r.getIdCliente()),court(r.getIdCancha()),text(r.getFechaReserva()),slot(r.getIdHorario()),money(r.getTotal()),text(r.getEstado()));

        else if(entity instanceof Pago p) values=List.of("#"+p.getIdReserva()+" · "+client(reservas.buscarPorId(p.getIdReserva()).getIdCliente()),text(p.getFechaPago()),money(p.getMonto()),text(p.getMetodoPago()),text(p.getEstado()));

        else values=fields(kind).stream().map(f->text(bean.getPropertyValue(f.name()))).toList();

        return new Row(id,values);

    }

    @GetMapping("/panel/{kind}") String section(@PathVariable String kind,@RequestParam(defaultValue="") String q,@RequestParam(required=false) Long edit,@RequestParam(required=false) Long delete,@RequestParam(required=false) LocalDate date,@RequestParam Map<String,String> params,Model model) {

        list(kind);LocalDate day=date==null?LocalDate.now(ZoneId.of("America/Lima")):date;

        var form=new LinkedHashMap<String,String>();for(Field f:fields(kind)) form.put(f.name(),f.type().equals("date")?day.toString():f.options().isEmpty()?"":f.options().getFirst().value());

        if(edit!=null) {var bean=new BeanWrapperImpl(find(kind,edit));for(Field f:fields(kind)) form.put(f.name(),text(bean.getPropertyValue(f.name())));}

        for(String key:List.of("idCliente","idCancha","idHorario")) if(edit==null&&params.containsKey(key)) form.put(key,params.get(key));

        if(!model.containsAttribute("form")) model.addAttribute("form",form);

        model.addAttribute("editId",edit);model.addAttribute("fields",fields(kind));model.addAttribute("kind",kind);model.addAttribute("active",kind);model.addAttribute("title",Character.toUpperCase(kind.charAt(0))+kind.substring(1));model.addAttribute("headers",headings(kind));model.addAttribute("q",q);model.addAttribute("date",day);

        String search=normalized(q);model.addAttribute("rows",list(kind).stream().map(e->row(kind,e)).filter(r->Arrays.stream(search.split("\\s+")).allMatch(term->normalized(r.id()+" "+String.join(" ",r.values())).contains(term))).sorted(Comparator.comparing(Row::id).reversed()).toList());

        if(delete!=null) model.addAttribute("deleting",row(kind,find(kind,delete)));

        if(kind.equals("horarios")||kind.equals("reservas")) availability(day,model);

        return "entity";

    }

    private void availability(LocalDate day,Model model) {

        var courts=cached("canchas",canchas::listar);var all=cached("reservas",reservas::listar);model.addAttribute("courts",courts);

        model.addAttribute("slots",cached("horarios",horarios::listar).stream().sorted(Comparator.comparing(Horario::getHoraInicio)).map(h->new Slot(turno(h),courts.stream().map(c->{

            String state=!"Disponible".equalsIgnoreCase(c.getEstado())?c.getEstado():!"Disponible".equalsIgnoreCase(h.getEstado())?h.getEstado():"Disponible";

            if(state.equals("Disponible")&&all.stream().anyMatch(r->r.getIdCancha().equals(c.getId())&&!"Cancelada".equalsIgnoreCase(r.getEstado())&&day.atTime(h.getHoraInicio()).isBefore(end(r.getFechaReserva(),schedule(r.getIdHorario())))&&start(r).isBefore(end(day,h)))) state="Reservado";

            if(state.equals("Disponible")&&!day.atTime(h.getHoraInicio()).isAfter(LocalDateTime.now(ZoneId.of("America/Lima")))) state="Finalizado";

            return new Cell(state,"/panel/reservas?date="+day+"&idCancha="+c.getId()+"&idHorario="+h.getId()+"#formulario");

        }).toList())).toList());

    }

    @PostMapping("/panel/{kind}/guardar") String save(@PathVariable String kind,@RequestParam Map<String,String> params,Model model,RedirectAttributes redirect) {

        Long id=null;

        try {

            if(!params.getOrDefault("id","").isBlank()) id=Long.valueOf(params.get("id"));

            Object entity=switch(kind) {case "clientes"->new Cliente();case "canchas"->new Cancha();case "horarios"->new Horario();case "reservas"->new Reserva();case "pagos"->new Pago();default->throw new IllegalArgumentException("Sección desconocida.");};

            BeanWrapperImpl bean=new BeanWrapperImpl(entity);

            for(Field f:fields(kind)) {

                String raw=params.getOrDefault(f.name(),"");Object value=raw;

                if(f.name().startsWith("id")) value=raw.isBlank()?null:Long.valueOf(raw);

                else if(f.type().equals("date")) value=raw.isBlank()?null:LocalDate.parse(raw);

                else if(f.type().equals("time")) value=raw.isBlank()?null:LocalTime.parse(raw);

                else if(f.type().equals("number")) value=f.name().equals("numero")?(Object)Integer.valueOf(raw):Double.valueOf(raw);

                bean.setPropertyValue(f.name(),value);

            }

            switch(kind) {case "clientes"->{if(id==null)clientes.guardar((Cliente)entity);else clientes.actualizar(id,(Cliente)entity);}case "canchas"->{if(id==null)canchas.guardar((Cancha)entity);else canchas.actualizar(id,(Cancha)entity);}case "horarios"->{if(id==null)horarios.guardar((Horario)entity);else horarios.actualizar(id,(Horario)entity);}case "reservas"->{if(id==null)reservas.guardar((Reserva)entity);else reservas.actualizar(id,(Reserva)entity);}case "pagos"->{if(id==null)pagos.guardar((Pago)entity);else pagos.actualizar(id,(Pago)entity);}}

            redirect.addFlashAttribute("notice","Registro guardado correctamente.");return "redirect:/panel/"+kind;

        }catch(ResponseStatusException|IllegalArgumentException|java.time.DateTimeException|org.springframework.beans.BeansException|org.springframework.dao.DataIntegrityViolationException ex) {

            model.addAttribute("error",message(ex));model.addAttribute("form",params);return section(kind,"",id,null,null,Map.of(),model);

        }

    }

    @PostMapping("/panel/{kind}/{id}/eliminar") String remove(@PathVariable String kind,@PathVariable long id,RedirectAttributes redirect) {

        try {switch(kind) {case "clientes"->clientes.eliminar(id);case "canchas"->canchas.eliminar(id);case "horarios"->horarios.eliminar(id);case "reservas"->reservas.eliminar(id);case "pagos"->pagos.eliminar(id);default->throw new IllegalArgumentException("Sección desconocida.");}redirect.addFlashAttribute("notice","Registro eliminado correctamente.");}

        catch(ResponseStatusException|IllegalArgumentException ex) {redirect.addFlashAttribute("error",message(ex));}

        return "redirect:/panel/"+kind;

    }

    private String message(Exception ex) {return ex instanceof ResponseStatusException r?r.getReason():ex instanceof org.springframework.dao.DataIntegrityViolationException?"El registro está duplicado o vinculado a otros datos.":"Revisa los datos del formulario. "+(ex instanceof IllegalArgumentException&&ex.getMessage().contains("contraseñas")?ex.getMessage():"");}

}
