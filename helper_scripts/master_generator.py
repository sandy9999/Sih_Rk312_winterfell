from random import *
from datetime import *
import csv

def gen_datetime(min_year=2020, max_year=datetime.now().year):
    # generate a datetime in format yyyy-mm-dd hh:mm:ss.000000
    start = datetime(min_year, 1, 1, 00, 00, 00)
    years = max_year - min_year + 1
    end = start + timedelta(days=200 * years)#200 to take into consideration only the first few months of the current year
    return start + (end - start) * random()

def generate_ipdr_data(phoneNumber, imei, imsi, cellid_set):
    privateIP = str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255))
    privatePort = randint(0, 65535)
    publicIP = str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255))
    publicPort = randint(0, 65535)
    destIP = str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255)) + "." + str(randint(0, 255))
    destPort = randint(0, 65535)
    startTime = gen_datetime()
    duration = randint(60, 7200)
    endTime = startTime + timedelta(seconds=duration)
    access_type_list = ["2G", "3G", "4G"]
    originCellIDTriple = cellid_set[randint(0, len(cellid_set)-1)]
    originCellID = originCellIDTriple["cellID"]
    originLat = originCellIDTriple["latitude"]
    originLong = originCellIDTriple["longitude"]
    uplinkVolume = randint(10, 1000)
    downlinkVolume = randint(10, 1000)
    totalVolume = uplinkVolume + downlinkVolume
    accessType = access_type_list[randint(0, len(access_type_list)-1)]
    return {"privateIP": privateIP, "privatePort": privatePort, "publicIP": publicIP, "publicPort": publicPort, "destIP": destIP, "destPort": destPort, "phoneNumber": phoneNumber, "imei": imei, "imsi": imsi, "startTime": startTime, "endTime": endTime, "originCellID": originCellID, "originLat": originLat, "originLong": originLong, "uplinkVolume": uplinkVolume, "downlinkVolume": downlinkVolume, "totalVolume": totalVolume, "accessType": accessType }

def generate_cdr_data(phoneNumber, imei, imsi, cellid_set):
    call_types = ["CALL-IN", "CALL-OUT", "SMS-IN", "SMS-OUT"]
    access_type_list = ["2G", "3G", "4G"]
    originCellIDTriple = cellid_set[randint(0, len(cellid_set)-1)]
    destCellIDTriple = cellid_set[randint(0, len(cellid_set)-1)]
    originCellID = originCellIDTriple["cellID"]
    originLat = originCellIDTriple["latitude"]
    originLong = originCellIDTriple["longitude"]
    destCellID = destCellIDTriple["cellID"]
    destLat = destCellIDTriple["latitude"]
    destLong = destCellIDTriple["longitude"]
    callerNumber = phoneNumber
    calledNumber = '9' + str(randint(10**(9-1), (10**9)-1))
    startTime = gen_datetime()
    duration = randint(60, 7200)
    endTime = startTime + timedelta(seconds=duration)
    callType = call_types[randint(0, len(call_types)-1)]
    connectionType = 'PP'
    accessType = access_type_list[randint(0, len(access_type_list)-1)]
    return {"callerNumber": callerNumber, "calledNumber": calledNumber, "startTime": startTime, "callDuration": duration, "endTime": endTime, "originCellID": originCellID, "destCellID": destCellID, "originLat": originLat, "destLat": destLat, "originLong": originLong, "destLong": destLong, "callType": callType, "imei": imei, "imsi": imsi, "connectionType": connectionType, "accessType": accessType}

def generate_common_fields():
    common_fields_data = []
    for i in range(1000):
        phoneNumber = '9' + str(randint(10**(9-1), (10**9)-1))
        imei = str(randint(10**(15-1), (10**15)-1))
        imsi = str(randint(10**(15-1), (10**15)-1))
        common_fields_data.append({"phoneNumber": phoneNumber, "imei": imei, "imsi": imsi})
    return common_fields_data

def generate_cellid_set():
    cellid_set = []
    csvfile = open('404.csv', 'r')
    fieldnames = ("radio","mcc","net","area","cell","unit","lon","lat","range","samples","changeable","created","updated","averageSignal")
    reader = csv.DictReader( csvfile, fieldnames)
    for row in reader:
<<<<<<< HEAD
        if row["mcc"] == "404" and row["net"] == "40":
            cellid_set.append({"cellID": row["mcc"]+row["net"]+"-"+row["area"]+"-"+row["cell"], "latitude": row["lat"], "longitude": row["lon"]})
=======
        cellid_set.append({"cellID": row["mcc"]+row["net"]+"-"+row["area"]+"-"+row["cell"], "latitude": row["lat"], "longitude": row["lon"]})
>>>>>>> [fix] CDR, IPDR generator, schema
    return cellid_set

cellid_set = generate_cellid_set()
common_fields_data = generate_common_fields()
ipdrFile = open('ipdrData.csv','w',newline='')
ipdrFieldnames = ['privateIP', 'privatePort', 'publicIP', 'publicPort', 'destIP', 'destPort', 'phoneNumber', 'imei', 'imsi', 'startTime', 'endTime', 'originCellID', 'originLat', 'originLong', 'uplinkVolume', 'downlinkVolume', 'totalVolume', 'accessType']
ipdrWriter = csv.DictWriter(ipdrFile, fieldnames = ipdrFieldnames)
ipdrWriter.writeheader()

cdrFile = open('cdrData.csv','w',newline='')
cdrFieldnames = ['callerNumber', 'calledNumber', 'startTime', 'callDuration', 'endTime', 'originCellID', 'destCellID', 'originLat', 'destLat', 'originLong', 'destLong', 'callType', 'imei', 'imsi', 'connectionType', 'accessType']
cdrWriter = csv.DictWriter(cdrFile, fieldnames = cdrFieldnames)
cdrWriter.writeheader()

for i in range(1, 500):
    random_common_fields = common_fields_data[randint(0, len(common_fields_data)-1)]
    phoneNumber = random_common_fields["phoneNumber"]
    imei = random_common_fields["imei"]
    imsi = random_common_fields["imsi"]
    returnedDict = generate_cdr_data(phoneNumber, imei, imsi, cellid_set)
    cdrWriter.writerow(returnedDict)
    returnedDict = generate_ipdr_data(phoneNumber, imei, imsi, cellid_set)
    ipdrWriter.writerow(returnedDict)

random_common_fields = common_fields_data[0]
phoneNumber = random_common_fields["phoneNumber"]
imei = random_common_fields["imei"]
imsi = random_common_fields["imsi"]
for i in range(10):
    returnedDict = generate_cdr_data(phoneNumber, imei, imsi, cellid_set)
    cdrWriter.writerow(returnedDict)
for i in range(10):
    returnedDict = generate_ipdr_data(phoneNumber, imei, imsi, cellid_set)
    ipdrWriter.writerow(returnedDict)