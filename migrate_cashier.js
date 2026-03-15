const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'hanginghome',
    password: 'admin',
    port: 5432,
});

async function migratePermissions() {
    try {
        const res = await pool.query(`
      UPDATE users 
      SET permissions = (
        SELECT jsonb_agg(
            CASE 
                WHEN elem::text = '"access_kiosk"' THEN '"cashier"'::jsonb
                ELSE elem
            END
        )
        FROM jsonb_array_elements(permissions) AS elem
      )
      WHERE permissions @> '"access_kiosk"';
    `);
        console.log('Migrated old access_kiosk permissions to cashier:', res.rowCount, 'rows affected.');
    } catch (err) {
        console.error('Error migrating permissions', err);
    } finally {
        pool.end();
    }
}

migratePermissions();
