-- Tested on a Neon branch before production. Preserves existing rows and IDs.
ALTER TABLE voley_playa.horario ADD COLUMN IF NOT EXISTS estado varchar(30) NOT NULL DEFAULT 'Disponible';
ALTER TABLE voley_playa.cliente ALTER COLUMN dni DROP NOT NULL;

DO $$
DECLARE rule record;
BEGIN
  FOR rule IN SELECT * FROM (VALUES
    ('cancha','vp_cancha_numero_positivo','numero > 0'),
    ('horario','vp_horario_horas_validas','hora_fin <> hora_inicio'),
    ('horario','vp_horario_precio_positivo','precio > 0'),
    ('reserva','vp_reserva_total_positivo','total > 0'),
    ('pago','vp_pago_monto_positivo','monto > 0')
  ) AS rules(table_name,constraint_name,expression)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid=format('voley_playa.%I',rule.table_name)::regclass AND conname=rule.constraint_name) THEN
      EXECUTE format('ALTER TABLE voley_playa.%I ADD CONSTRAINT %I CHECK (%s)',rule.table_name,rule.constraint_name,rule.expression);
    END IF;
  END LOOP;
END $$;
-- Existing cancha.numero, cliente.dni/email and relation constraints are retained.
-- Historical duplicate horarios 16/19 remain; new duplicates are rejected by the service.
