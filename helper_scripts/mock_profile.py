from random import *
from datetime import *
import csv

def generate_data():
  locations = ["Adyar", "Mylapore", "Perambur", "Royapettah"]
  names = ["Sandhya", "Hrishi", "Ram", "Deeraj", "Abishake", "Kumaran"]
  companies = ["Google", "Microsoft", "Amazon", "DEShaw", "Uber"]
  address = locations[randint(0, len(locations)-1)]
  name = names[randint(0, len(names)-1)]
  phoneNumber = '9' + str(randint(10**(9-1), (10**9)-1))
  age = randint(20, 50)
  email = name + "@example.com"
  aadharNumber = str(randint(10**(12-1), (10**12)-1))
  company = companies[randint(0, len(companies)-1)]
  remarks = "hello there"
  imei = str(randint(10**(15-1), (10**15)-1))
  imsi = str(randint(10**(15-1), (10**15)-1))
  return {"phoneNumber": phoneNumber, "name": name, "age": age, "email": email, "aadharNumber": aadharNumber, "company": company, "address": address, "remarks": remarks, "imei": imei, "imsi": imsi}


with open('profileData.csv','w',newline='') as file:
  fieldnames = ['phoneNumber', 'name', 'age', 'email', 'aadharNumber', 'company', 'address', 'remarks', 'imei', 'imsi']
  writer = csv.DictWriter(file, fieldnames = fieldnames)
  writer.writeheader()
  for i in range(1, 10):
    returnedDict = generate_data()
    writer.writerow(returnedDict)
