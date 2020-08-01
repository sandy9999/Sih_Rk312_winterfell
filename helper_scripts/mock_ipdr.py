from random import *
from datetime import *
from geopy.geocoders import Nominatim
import csv

def gen_datetime(min_year=2020, max_year=datetime.now().year):
    # generate a datetime in format yyyy-mm-dd hh:mm:ss.000000
    start = datetime(min_year, 1, 1, 00, 00, 00)
    years = max_year - min_year + 1
    end = start + timedelta(days=365 * years)
    return start + (end - start) * random()

def generate_data():
    privateIP = str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255))
    privatePort = randint(0, 65535)
    publicIP = str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255))
    publicPort = randint(0, 65535)
    destIP = str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255))
    destPort = randint(0, 65535)
    phoneNumber = '9' + str(randint(10**(9-1), (10**9)-1))
    imei = str(randint(10**(15-1), (10**15)-1))
    imsi = str(randint(10**(15-1), (10**15)-1))  
    startTime = gen_datetime()
    duration = 2400
    endTime = startTime + timedelta(seconds=duration)
    locations = ["Adyar", "Mylapore", "Perambur", "Royapettah"]
    address = locations[randint(0, len(locations)-1)]
    geolocator = Nominatim(user_agent="Your_Name")
    location = geolocator.geocode(address)
    originLat = location.latitude
    originLong = location.longitude
    uplinkVolume = randint(10, 1000)
    downlinkVolume = randint(10, 1000)
    totalVolume = uplinkVolume + downlinkVolume
    accessType = "2G"
    return {"privateIP": privateIP, "privatePort": privatePort, "publicIP": publicIP, "publicPort": publicPort, "destIP": destIP, "destPort": destPort, "phoneNumber": phoneNumber, "imei": imei, "imsi": imsi, "startTime": startTime, "endTime": endTime, "originLat": originLat, "originLong": originLong, "uplinkVolume": uplinkVolume, "downlinkVolume": downlinkVolume, "totalVolume": totalVolume, "accessType": accessType }


with open('ipdrData.csv','w',newline='') as file:
  fieldnames = ['privateIP', 'privatePort', 'publicIP', 'publicPort', 'destIP', 'destPort', 'phoneNumber', 'imei', 'imsi', 'startTime', 'endTime', 'originLat', 'originLong', 'uplinkVolume', 'downlinkVolume', 'totalVolume', 'accessType']
  writer = csv.DictWriter(file, fieldnames = fieldnames)
  writer.writeheader()
  for i in range(1, 10):
    returnedDict = generate_data()
    writer.writerow(returnedDict)
