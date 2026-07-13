USE bcp_db;

-- Demo admin password = "Admin1234" (bcrypt hash generated with 10 rounds)
INSERT INTO users (name, email, phone, password_hash, role) VALUES
('Admin User', 'admin@example.com', '+992900000000', '$2b$10$C1AXvY0e9c8n8m3nQfXeMOeUu6VZ0m7Cz2H5tqvdCk1r2Cw9m9Nqm', 'admin');
-- NOTE: run `node backend/scripts/hashPassword.js Admin1234` and replace the hash above
-- before using in production. See README for details.

INSERT INTO categories (name, slug, icon) VALUES
('Электроника', 'electronics', 'cpu'),
('Либос', 'fashion', 'shirt'),
('Хона ва боғ', 'home-garden', 'home'),
('Варзиш', 'sports', 'dumbbell'),
('Зебоӣ', 'beauty', 'sparkles');

INSERT INTO products (category_id, title, description, price, compare_price, stock, rating, rating_count, images, is_featured) VALUES
(1, 'Гӯшмонаки Bluetooth Pro', 'Гӯшмонаки бесим бо садои баланд ва батареяи дарозмуддат.', 249.00, 320.00, 45, 4.6, 128, JSON_ARRAY('https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'), TRUE),
(1, 'Соати мошинии смарт', 'Пайгирии саломатӣ, огоҳиномаҳо ва GPS дар як дастгоҳ.', 540.00, 650.00, 30, 4.8, 96, JSON_ARRAY('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'), TRUE),
(2, 'Куртаи пахтагии классикӣ', 'Матои 100% пахта, барои ҳар мавсим мувофиқ.', 180.00, NULL, 120, 4.3, 54, JSON_ARRAY('https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800'), FALSE),
(3, 'Маҷмӯаи зарфҳои ошпазӣ', 'Маҷмӯаи 8-порчагӣ аз пӯлоди зангнагир.', 410.00, 480.00, 18, 4.7, 41, JSON_ARRAY('https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=800'), TRUE),
(4, 'Ҷойпоии варзишӣ', 'Барои давидан ва машқҳои ҳаррӯза мувофиқ.', 275.00, NULL, 60, 4.4, 77, JSON_ARRAY('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'), FALSE),
(5, 'Маҷмӯаи ҳифзи пӯст', 'Крем, тоник ва сирум барои пӯсти солим.', 165.00, 210.00, 85, 4.5, 63, JSON_ARRAY('https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800'), TRUE);
