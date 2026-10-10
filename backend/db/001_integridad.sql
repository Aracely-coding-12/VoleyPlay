-- Ejecutar una vez en PostgreSQL, antes de publicar el backend actualizado.
-- No borra registros. Si hay duplicados o referencias huérfanas, aborta
-- toda la transacción para que esos datos se revisen primero.
BEGIN;
ALTER TABLE voley_playa.cancha ADD CONSTRAINT vp_cancha_numero_unique UNIQUE (numero);
ALTER TABLE voley_playa.cliente ADD CONSTRAINT vp_cliente_dni_unique UNIQUE (dni);
ALTER TABLE voley_playa.horario ADD CONSTRAINT vp_horario_turno_unique UNIQUE (hora_inicio, hora_fin);
ALTER TABLE voley_playa.reserva ADD CONSTRAINT vp_reserva_cliente_fk FOREIGN KEY (id_cliente) REFERENCES voley_playa.cliente(id_cliente);
ALTER TABLE voley_playa.reserva ADD CONSTRAINT vp_reserva_cancha_fk FOREIGN KEY (id_cancha) REFERENCES voley_playa.cancha(id_cancha);
ALTER TABLE voley_playa.reserva ADD CONSTRAINT vp_reserva_horario_fk FOREIGN KEY (id_horario) REFERENCES voley_playa.horario(id_horario);
ALTER TABLE voley_playa.pago ADD CONSTRAINT vp_pago_reserva_fk FOREIGN KEY (id_reserva) REFERENCES voley_playa.reserva(id_reserva);
ALTER TABLE voley_playa.cancha ADD CONSTRAINT vp_cancha_numero_positivo CHECK (numero > 0);
ALTER TABLE voley_playa.horario ADD CONSTRAINT vp_horario_horas_validas CHECK (hora_fin <> hora_inicio);
ALTER TABLE voley_playa.horario ADD CONSTRAINT vp_horario_precio_positivo CHECK (precio > 0);
ALTER TABLE voley_playa.reserva ADD CONSTRAINT vp_reserva_total_positivo CHECK (total > 0);
ALTER TABLE voley_playa.pago ADD CONSTRAINT vp_pago_monto_positivo CHECK (monto > 0);
COMMIT;
