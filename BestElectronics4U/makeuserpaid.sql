

UPDATE user
SET paid_user = TRUE
WHERE email = 'FemiAdeon@gmail.com'; -- or use WHERE email = 'user@example.com'


SELECT user_id, email, paid_user
FROM electronics4u.user
WHERE email = 'FemiAdeon@gmail.com';
