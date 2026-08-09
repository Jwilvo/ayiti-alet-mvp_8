-- Lis Depatman ak Komin Ayiti — done referans pou zonaj alèt yo.
-- Sous: divizyon administratif ofisyèl (10 depatman, ~140 komin). Si w wè yon
-- non ki manke oswa ki ekri mal, ou ka ajoute/korije dirèkteman ak INSERT/UPDATE.

INSERT INTO komin_ayiti (depatman, komin) VALUES
-- Ouest
('Ouest', 'Pòtoprens'), ('Ouest', 'Kafou'), ('Ouest', 'Delmas'), ('Ouest', 'Petyonvil'),
('Ouest', 'Kenscoff'), ('Ouest', 'Tabarre'), ('Ouest', 'Site Solèy'), ('Ouest', 'Gressier'),
('Ouest', 'Leyogàn'), ('Ouest', 'Gran Gwav'), ('Ouest', 'Ti Gwav'), ('Ouest', 'Fon Vèrèt'),
('Ouest', 'Gantye'), ('Ouest', 'Kònyon'), ('Ouest', 'Kwadèboukè'), ('Ouest', 'Tomazo'),
('Ouest', 'Akayè'), ('Ouest', 'Kabarè'), ('Ouest', 'Anse à Galèt'), ('Ouest', 'Gonav (Latibonit Anba)'),

-- Nò
('Nò', 'Okap'), ('Nò', 'Aka Nò'), ('Nò', 'Grand Rivyè dinò'), ('Nò', 'Bahon'),
('Nò', 'Milo'), ('Nò', 'Plèn Dinò'), ('Nò', 'Limonad'), ('Nò', 'Katye Moren'),
('Nò', 'Bòy'), ('Nò', 'Pòmago'), ('Nò', 'Lenbe'), ('Nò', 'Ba Lenbe'),
('Nò', 'Plezans'), ('Nò', 'Pilat'), ('Nò', 'Sen Rafayèl'), ('Nò', 'Dondon'),
('Nò', 'Lavikton'), ('Nò', 'Rankit'), ('Nò', 'Pyeman'),

-- Nòdès
('Nòdès', 'Fòlibète'), ('Nòdès', 'Fewouy'), ('Nòdès', 'Pèch'), ('Nòdès', 'Wanament'),
('Nòdès', 'Kapotiy'), ('Nòdès', 'Mon Òganize'), ('Nòdès', 'Two Dinò'), ('Nòdès', 'Sent Sizàn'),
('Nòdès', 'Teriye Wouj'), ('Nòdès', 'Karako Nòdès'), ('Nòdès', 'Valyè'), ('Nòdès', 'Monben Kwochi'), ('Nòdès', 'Karis'),

-- Nòdwès
('Nòdwès', 'Pòdepè'), ('Nòdwès', 'Latòti'), ('Nòdwès', 'Basen Ble'), ('Nòdwès', 'Chanmòl'),
('Nòdwès', 'Ansafòlè'), ('Nòdwès', 'Sen Lwi dinò'), ('Nòdwès', 'Bè Dèn'), ('Nòdwès', 'Bonbadopolis'),
('Nòdwès', 'Janrabèl'), ('Nòdwès', 'Mòl Sen Nikola'),

-- Latibonit
('Latibonit', 'Gonayiv'), ('Latibonit', 'Ennery'), ('Latibonit', 'Lestè'), ('Latibonit', 'Gwomòn'),
('Latibonit', 'Ansrouj'), ('Latibonit', 'Tèneuv'), ('Latibonit', 'Mamlad'), ('Latibonit', 'Sen Michèl Latalay'),
('Latibonit', 'Desalin'), ('Latibonit', 'Grandsalin'), ('Latibonit', 'Ti Rivyè Latibonit'), ('Latibonit', 'Verèt'),
('Latibonit', 'Lachapèl'), ('Latibonit', 'Sen Mak'), ('Latibonit', 'Likou'), ('Latibonit', 'Desdin'),

-- Sant
('Sant', 'Ench'), ('Sant', 'Sèka Kavajal'), ('Sant', 'Maisad'), ('Sant', 'Tomonn'),
('Sant', 'Sèka Lasous'), ('Sant', 'Bèlfontèn'), ('Sant', 'Tomasik'), ('Sant', 'Bwa Kayiman'),
('Sant', 'Savanèt'), ('Sant', 'Lasil'), ('Sant', 'Boukankare'),

-- Sid
('Sid', 'Okay'), ('Sid', 'Kanperen'), ('Sid', 'Chantal'), ('Sid', 'Tòbèk'),
('Sid', 'Il a Vach'), ('Sid', 'Manich'), ('Sid', 'Chadonyè'), ('Sid', 'Zangle'),
('Sid', 'Anriki'), ('Sid', 'Woch a Bato'), ('Sid', 'Kotobo'), ('Sid', 'Pò Piman'),
('Sid', 'Pòsali'), ('Sid', 'Sen Jan Disid'), ('Sid', 'Aken'), ('Sid', 'Kavayon'),
('Sid', 'Sen Lwi Disid'), ('Sid', 'Vye Bouk Daken'),

-- Grandans
('Grandans', 'Jeremi'), ('Grandans', 'Abriko'), ('Grandans', 'Bonbon'), ('Grandans', 'Koway'),
('Grandans', 'Bomon'), ('Grandans', 'Pestèl'), ('Grandans', 'Woso'), ('Grandans', 'Chanbelan'),
('Grandans', 'Damari'), ('Grandans', 'Ansdeno'), ('Grandans', 'Lezirwa'), ('Grandans', 'Mowon'),

-- Nip
('Nip', 'Miragwàn'), ('Nip', 'Ti Rivyè Nip'), ('Nip', 'Payan'), ('Nip', 'Fondènèg'),
('Nip', 'Ansavo'), ('Nip', 'Ano'), ('Nip', 'Lasil Nip'), ('Nip', 'Baradè'),
('Nip', 'Ti Twou Nip'), ('Nip', 'Plezans Disid'),

-- Sidès
('Sidès', 'Jakmèl'), ('Sidès', 'Kayjakmèl'), ('Sidès', 'Lavale'), ('Sidès', 'Marigo'),
('Sidès', 'Bene'), ('Sidès', 'Kotdefè'), ('Sidès', 'Bèlans'), ('Sidès', 'Grangozye'),
('Sidès', 'Tyòt'), ('Sidès', 'Ansapit')
ON CONFLICT (depatman, komin) DO NOTHING;
