import java.sql.*;

/** Read-only inspection; credentials are supplied only through environment variables. */
class DbAudit {
    public static void main(String[] args) throws Exception {
        try (Connection db = DriverManager.getConnection(System.getenv("DB_URL"), System.getenv("DB_USER"), System.getenv("DB_PASSWORD"))) {
            db.setReadOnly(true);
            db.setAutoCommit(false);
            String[] queries = {
                "SELECT current_database() AS database, current_setting('transaction_read_only') AS read_only",
                "SELECT table_name,column_name,data_type,column_default,is_nullable FROM information_schema.columns WHERE table_schema='voley_playa' ORDER BY table_name,ordinal_position",
                "SELECT c.relname AS table_name,k.conname,pg_get_constraintdef(k.oid) AS definition FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='voley_playa' ORDER BY c.relname,k.conname",
                "SELECT 'cliente' AS table_name,count(*) FROM voley_playa.cliente UNION ALL SELECT 'cancha',count(*) FROM voley_playa.cancha UNION ALL SELECT 'horario',count(*) FROM voley_playa.horario UNION ALL SELECT 'reserva',count(*) FROM voley_playa.reserva UNION ALL SELECT 'pago',count(*) FROM voley_playa.pago",
                "SELECT hora_inicio,hora_fin,array_agg(id_horario ORDER BY id_horario) AS ids FROM voley_playa.horario GROUP BY hora_inicio,hora_fin HAVING count(*)>1",
                "SELECT h.id_horario,h.hora_inicio,h.hora_fin,h.precio,count(r.id_reserva) AS linked_reservations FROM voley_playa.horario h LEFT JOIN voley_playa.reserva r USING(id_horario) WHERE h.id_horario IN(16,19) GROUP BY h.id_horario ORDER BY h.id_horario"
            };
            for (String sql : queries) {
                try (Statement statement = db.createStatement(); ResultSet rows = statement.executeQuery(sql)) {
                    var columns=rows.getMetaData();
                    while (rows.next()) {
                        var line=new StringBuilder();
                        for (int i=1;i<=columns.getColumnCount();i++) {
                            if (i>1) line.append(" | ");
                            line.append(columns.getColumnLabel(i)).append('=').append(rows.getString(i));
                        }
                        System.out.println(line);
                    }
                }
            }
            db.rollback();
        }
    }
}
