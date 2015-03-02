# tinderGift
Tinder for Gifts

[https://apps.facebook.com/tindergift](https://apps.facebook.com/tindergift)

# Instalacion
```sh
sudo apt-get install git
sudo apt-get install nodejs
sudo apt-get install npm
sudo npm install -g firebase-tools
git clone https://github.com/facutk/tinderGift.git 
cd tinderGift
python -m SimpleHTTPServer
```

# Mantenimiento
```sh
git add .
git commit -m "razon del cambio"
git push origin master
firebase deploy
```

# Mercadolibre
```sh
curl https://facutk.alwaysdata.net/mercadolibre/<URL_ARTICULO>
```

```json
{ 
    status: "ok | error",
    name: "item name",
    price: "$ XXX",
    thumbnail: "url",
    images: ['url1','urlN']
}
```
### Example
```sh
curl https://facutk.alwaysdata.net/mercadolibre/articulo.mercadolibre.com.ar/MLA-547757806-attiny2313-20pu-dip20-atmel-mcu-avr-_JM
```
### Returns
```json
{
  "images": [
    "http:\/\/mla-s1-p.mlstatic.com\/attiny2313-20pu-dip20-atmel-mcu-avr-17456-MLA20138648926_082014-O.jpg"
  ], 
  "name": "Attiny2313-20pu Dip20 Atmel Mcu Avr", 
  "price": "$ 42.00", 
  "status": "ok", 
  "thumbnail": "http:\/\/mla-s1-p.mlstatic.com\/attiny2313-20pu-dip20-atmel-mcu-avr-17456-MLA20138648926_082014-O.jpg"
}
```