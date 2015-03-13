from BeautifulSoup import BeautifulSoup
import requests

def get_ml_data( ml_url ):
    if ml_url.find("mercadolibre"):
        if ml_url[0:4] != "http":
            ml_url = "http://" + ml_url

        ret = {}
        ret["status"] = "Error"

        html = requests.get( ml_url ).text
        if not html:
            ret["description"] = "no html found"
            return ret

        soup = BeautifulSoup( html )
        name = soup.find('h1', {'itemprop': 'name'})

        if name:
            name = name.contents[0]
        else:
            ret["description"] = "no name found"
            return ret

        pricetag = soup.find('article', {'class': 'price ch-price '})
        if not pricetag:
            ret["description"] = "no pricetag found"
            return ret
        else:
            pricetag = pricetag.strong
            price_number = pricetag.contents[0].strip().replace(".","")
            price_decimal = pricetag.sup.contents[0]
            price = price_number + '.' + price_decimal
            if price.find(" ") > -1:
                price = price.split(" ")[1]

        images = []
        imgs = soup.find('figure', {'id': 'gallery_dflt'}).findAll('img')
        for img in imgs:
            img_src = img['src']
            if img_src[0:4] != "data":
                images.append( {'url': img_src } )

        ret['status'] = "ok"
        ret['name'] = name
        ret['price'] = price
        ret['images'] = images
        return ret

if __name__ == '__main__':
    url = "articulo.mercadolibre.com.ar/MLA-547757806-attiny2313-20pu-dip20-atmel-mcu-avr-_JM"
    data = get_ml_data( url )
    print data
