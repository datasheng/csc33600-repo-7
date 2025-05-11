

UPDATE user
SET paid_user = TRUE
WHERE email = 'example@gmail.com'; -- or use WHERE email = 'user@example.com'


SELECT user_id, email, paid_user
FROM electronics4u.user
WHERE email = 'example@gmail.com';
