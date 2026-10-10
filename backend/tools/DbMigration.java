import java.sql.*;
import java.nio.file.*;

/** Explicit migration runner. Caller must confirm the expected database hostname. */
class DbMigration {
    public static void main(String[] args) throws Exception {
        String url=System.getenv("DB_URL");
        String expected=System.getenv("DB_EXPECTED_HOST");
        if (args.length<1 || expected==null || !url.startsWith("jdbc:postgresql://"+expected+"/neondb?")) {
            throw new IllegalArgumentException("Migration target must match DB_EXPECTED_HOST and neondb.");
        }
        try (Connection db=DriverManager.getConnection(url,System.getenv("DB_USER"),System.getenv("DB_PASSWORD"))) {
            db.setAutoCommit(false);
            try (Statement statement=db.createStatement()) {
                for (String path : args) statement.execute(Files.readString(Path.of(path)));
                db.commit();
                System.out.println("Migration committed to confirmed target.");
            } catch (Exception failure) { db.rollback(); throw failure; }
        }
    }
}
