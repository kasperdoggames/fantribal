CREATE TABLE bands(
	id serial PRIMARY KEY,
	name text,
  thumbnail text,
	cover_photo text,
	bio text,
	owner text
);

CREATE TABLE venues(
	id serial PRIMARY KEY,
	name text,
  thumbnail text,
	cover_photo text,
	bio text,
	owner text
);


CREATE TABLE events(
	id serial PRIMARY KEY,
	band_id int8,
	token_id text,
	event_date int8,
	FOREIGN KEY(band_id) REFERENCES bands(id)
);

CREATE TABLE images(
	id serial PRIMARY KEY,
	band_id serial,
	title text,
  image_src text,
	FOREIGN KEY(band_id) REFERENCES bands(id)
);

CREATE TABLE merch(
	id serial PRIMARY KEY,
	event_id int8,
	title text,
	link_ref text,
	FOREIGN KEY(event_id) REFERENCES events(id)
);

INSERT INTO bands(name, thumbnail, cover_photo, bio, owner) VALUES('Behemoth','ipfs://bafkreif62xaf34wkzz2v65fz2lazhvy4igqq7xskd42se3adxjcw3hqfre','ipfs://bafkreif62xaf34wkzz2v65fz2lazhvy4igqq7xskd42se3adxjcw3hqfre','Bewolf','dogfood20.testnet');
INSERT INTO bands(name, thumbnail, cover_photo, bio, owner) VALUES('Funky Bananas','ipfs://bafybeig2oyb5677jbt5vk6yglovgnpzzp4waizkvhepjdhkwt65dovcnbi','ipfs://bafybeig2oyb5677jbt5vk6yglovgnpzzp4waizkvhepjdhkwt65dovcnbi','Banana Funk','dogfood20.testnet');
INSERT INTO bands(name, thumbnail, cover_photo, bio, owner) VALUES('Random New Band','ipfs://bafybeicudstqnunmre3kegkwexhsvxs67qlih7ks36slxwfznzezaz3hq4','ipfs://bafybeicudstqnunmre3kegkwexhsvxs67qlih7ks36slxwfznzezaz3hq4','A totally random group of people pretending to be a band','dogfood20.testnet');
INSERT INTO bands(name, thumbnail, cover_photo, bio, owner) VALUES('Slayer','ipfs://bafkreiflogemgncc7276gm5tylh7rqeplgtvpd4kvbquo54ykgl3pbbw6e','ipfs://bafkreiflogemgncc7276gm5tylh7rqeplgtvpd4kvbquo54ykgl3pbbw6e','Slay that slayer','dogfood20.testnet');
INSERT INTO bands(name, thumbnail, cover_photo, bio, owner) VALUES('Slipknot','ipfs://bafkreihqbas7jeh6gtmlbpnmwodr6xgzshthbjgftgrzvchjj75shgtn34','ipfs://bafkreihqbas7jeh6gtmlbpnmwodr6xgzshthbjgftgrzvchjj75shgtn34','Slippy knot is slippy','dogfood20.testnet');
INSERT INTO bands(name, thumbnail, cover_photo, bio, owner) VALUES('Sticky Cupboards','ipfs://bafybeifq5xigmhckcs4wno4uwxodnaa5aetwutokjyrji5xwesze37tpom','ipfs://bafybeifq5xigmhckcs4wno4uwxodnaa5aetwutokjyrji5xwesze37tpom','No one likes a sticky cupboard do they','dogfood20.testnet');

INSERT INTO images(band_id, title, image_src) VALUES (1, 'thumbnail', 'ipfs://bafkreif62xaf34wkzz2v65fz2lazhvy4igqq7xskd42se3adxjcw3hqfre');
INSERT INTO images(band_id, title, image_src) VALUES (4, 'thumbnail', 'ipfs://bafkreiflogemgncc7276gm5tylh7rqeplgtvpd4kvbquo54ykgl3pbbw6e');
INSERT INTO images(band_id, title, image_src) VALUES (5, 'thumbnail', 'ipfs://bafkreihqbas7jeh6gtmlbpnmwodr6xgzshthbjgftgrzvchjj75shgtn34');

INSERT INTO venues(name, thumbnail, cover_photo, bio, owner) VALUES('Sticky Cupboards','ipfs://bafybeifq5xigmhckcs4wno4uwxodnaa5aetwutokjyrji5xwesze37tpom','ipfs://bafybeifq5xigmhckcs4wno4uwxodnaa5aetwutokjyrji5xwesze37tpom','No one likes a sticky cupboard do they','dogfood20.testnet');
