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
  locations = ["Adyar", "Mylapore", "Perambur", "Royapettah"]
  call_types = ["CALL-IN", "CALL-OUT", "SMS-IN", "SMS-OUT"]
  address = locations[randint(0, len(locations)-1)]
  geolocator = Nominatim(user_agent="Your_Name")
  location = geolocator.geocode(address)
  CALLING_NO = '9' + str(randint(10**(9-1), (10**9)-1))
  CALLED_NO = '9' + str(randint(10**(9-1), (10**9)-1))
  START_TIME = gen_datetime()
  DURATION = 2400
  END_TIME = START_TIME + timedelta(seconds=DURATION)
  LAT_ORIGIN = location.latitude
  LAT_TERM = location.latitude
  LONG_ORIGIN = location.longitude
  LONG_TERM = location.longitude
  CALL_TYPE = call_types[randint(0, len(call_types)-1)]
  IMEI = str(randint(10**(15-1), (10**15)-1))
  IMSI = str(randint(10**(15-1), (10**15)-1))
  CONN_TYPE = 'PP'
  ACCESS_TYPE = '2G'
  return {"callerNumber": CALLING_NO, "calledNumber": CALLED_NO, "startTime": START_TIME, "callDuration": DURATION, "endTime": END_TIME, "originLat": LAT_ORIGIN, "destLat": LAT_TERM, "originLong": LONG_ORIGIN, "destLong": LONG_TERM, "callType": CALL_TYPE, "imei": IMEI, "imsi": IMSI, "connectionType": CONN_TYPE, "accessType": ACCESS_TYPE}


with open('data.csv','w',newline='') as file:
  fieldnames = ['callerNumber', 'calledNumber', 'startTime', 'callDuration', 'endTime', 'originLat', 'destLat', 'originLong', 'destLong', 'callType', 'imei', 'imsi', 'connectionType', 'accessType']
  writer = csv.DictWriter(file, fieldnames = fieldnames)
  writer.writeheader()
  for i in range(1, 10):
    returnedDict = generate_data()
    writer.writerow(returnedDict)
