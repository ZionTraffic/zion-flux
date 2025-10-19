-- Adicionar george@ziontraffic.com.br como owner do sistema
INSERT INTO public.user_roles (user_id, role)
VALUES ('d71b327c-bb1e-4e0c-bfcc-aae29917b391', 'owner')
ON CONFLICT (user_id, role) DO NOTHING;

-- Opcional: Também adicionar o outro usuário como owner (para backup)
INSERT INTO public.user_roles (user_id, role)
VALUES ('9b38d1ff-b312-4bee-a6b1-2c1c88278bd0', 'owner')
ON CONFLICT (user_id, role) DO NOTHING;