import scrapy
from scrapy.http import Request
from airports.items import AirportsItem


class AirportsSpider(scrapy.Spider):
    name = "airports"
    allowed_domains = ["en.wikipedia.org"]
    start_urls = [
        "http://en.wikipedia.org/wiki/List_of_airports_in_the_United_States"
      ]

    def parse(self, response):
        tables = response.xpath('//table[2]')
        for sel in tables.xpath('tr[3]/td/div/ul/li'):

            url = "http://en.wikipedia.org" + sel.xpath('a/@href').extract()[0].encode("utf-8")
            request = Request(url, callback=self.parse_state)
            request.meta['state'] = sel.xpath('a/text()').extract()[0].encode("utf-8")

            yield request

    def parse_state(self, response):
        tables = response.xpath('//table[1]')
        state = response.meta['state']
        for sel in tables.xpath('tr'):

            item = AirportsItem()
            item['state'] = state

            #check to see if column is a header or had airport information
            #using the airport's url as a proxy
            if len(sel.xpath('td[5]/b/a/@href').extract()) > 0:
              #print city and aiport link
              item['airport'] = sel.xpath('td[5]/b/a/text()').extract()[0].encode("utf-8")
              item['city']    = sel.xpath('td[1]/a/text()').extract()[0].encode("utf-8")

              #makes request to individual airport wikis to get geo cords
              url = "http://en.wikipedia.org" + sel.xpath('td[5]/b/a/@href').extract()[0].encode("utf-8")
              request = Request(url, callback=self.get_cords)
              request.meta['item'] = item
              yield request

            elif len(sel.xpath('td[5]/a/@href').extract()) > 0:
              #print city and aiport link
              item['airport'] = sel.xpath('td[5]/a/text()').extract()[0].encode("utf-8")
              item['city']    = sel.xpath('td[1]/a/text()').extract()[0].encode("utf-8")

              #makes request to individual airport wikis to get geo cords
              url = "http://en.wikipedia.org" + sel.xpath('td[5]/a/@href').extract()[0].encode("utf-8")
              request = Request(url, callback=self.get_cords)
              request.meta['item'] = item
              yield request

            else:
                continue


    # Gets geo cords for the airport
    def get_cords(self, response):
        geo_cord_span = response.xpath('//span[@class="geo-dec"]/text()')
        cords = geo_cord_span.extract()[0].encode("utf-8").split()

        faa = response.xpath('//span[@class="nickname"]/text()').extract()

        item = response.meta['item']
        item['faa'] = faa
        item['lat'] = float(cords[0][:-3])
        item['lng'] = float(cords[1][:-3])

        yield item






