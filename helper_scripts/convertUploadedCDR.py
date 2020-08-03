import xlrd
import re
from datetime import *
import csv

fieldsDictionary = {'callernumber': 'callerNumber', 'callingnumber':'callerNumber', 'mobilenumber': 'callerNumber', 'callingno': 'callerNumber', 'othernumber': 'calledNumber', 'callednumber': 'calledNumber', 'calledno': 'calledNumber', 'calltype': 'callType', 'date': 'date', 'time': 'time', 'callduration': 'callDuration', 'duration': 'callDuration', 'dursec': 'callDuration', 'durs': 'callDuration', "imei": "imei", "esn": "imei", "imsi": "imsi", "imsino": "imsi", "calldatetime": "time" }

def get_excel_header_row(workbook, worksheet, num_rows, num_cells):
    curr_row = -1
    #Find heading row
    while curr_row < num_rows:
        curr_row += 1
        row = worksheet.row(curr_row)
        emptyPresent = False
        for curr_cell in range(0, num_cells):
            # Cell Types: 0=Empty, 1=Text, 2=Number, 3=Date, 4=Boolean, 5=Error, 6=Blank
            cell_type = worksheet.cell_type(curr_row, curr_cell)
            cell_value = worksheet.cell_value(curr_row, curr_cell)
            if cell_type == 0:
                emptyPresent = True
                break
        if emptyPresent == False:
            return row, curr_row

def get_csv_header_row(csv_reader):
    curr_row = -1
    for row in csv_reader:
        curr_row +=1
        emptyPresent = False
        for x in row:
            if x == '':
                emptyPresent = True
                break
        if emptyPresent == False:
            return row, curr_row

def parse_xls(workbook_name, cdrFile):
    workbook = xlrd.open_workbook(workbook_name)
    worksheet = workbook.sheet_by_index(0)
    num_rows = worksheet.nrows - 1
    num_cells = worksheet.ncols - 1

    header_row, header_row_index = get_excel_header_row(workbook, worksheet, num_rows, num_cells)    
    header_row_processed = [worksheet.cell_value(header_row_index, i) for i in range(0, num_cells)]
    header_row_cleaned = [re.sub('[\W_]+', '', x).lower() for x in header_row_processed]
    print(header_row_cleaned)
    curr_row = header_row_index
    while curr_row < num_rows:
        curr_row += 1
        row = worksheet.row(curr_row)
        emptyRowPresent = True
        for curr_cell in range(0, min(4, num_cells)):
            cell_type = worksheet.cell_type(curr_row, curr_cell)
            if cell_type != 0:
                emptyRowPresent = False
                break
        if emptyRowPresent == True:
            break
        jsonRow = {}    
        for curr_cell in range(num_cells):
            if header_row_cleaned[curr_cell] in fieldsDictionary.keys():
                if fieldsDictionary[header_row_cleaned[curr_cell]] == "callerNumber" or fieldsDictionary[header_row_cleaned[curr_cell]] == "calledNumber":
                    if isinstance(row[curr_cell].value, float):
                        jsonRow.update({fieldsDictionary[header_row_cleaned[curr_cell]]: str(int(row[curr_cell].value))})
                    else:
                        break
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "callType":
                    cleaned_val = re.sub('[\W_]+', '',row[curr_cell].value ).lower()
                    if cleaned_val == "incoming" or cleaned_val == "in" or cleaned_val == "ic" or cleaned_val=="callin":
                        jsonRow.update({"callType": "in"})
                    elif cleaned_val == "outgoing" or cleaned_val == "out" or cleaned_val == "oc" or cleaned_val=="callout":
                        jsonRow.update({"callType": "out"})
                    if cleaned_val == "smsincoming" or cleaned_val == "smsin" or cleaned_val == "isms" or cleaned_val=="smt":
                        jsonRow.update({"callType": "smsin"})
                    if cleaned_val == "smsoutgoing" or cleaned_val == "smsout" or cleaned_val == "osms" or cleaned_val == "smo":
                        jsonRow.update({"callType": "smsout"})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "date":
                    py_date = xlrd.xldate.xldate_as_datetime(row[curr_cell].value, workbook.datemode)
                    jsonRow.update({"date": py_date})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "time":
                    py_time = xlrd.xldate.xldate_as_datetime(row[curr_cell].value, workbook.datemode)
                    jsonRow.update({"time": py_time})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "callDuration":
                    jsonRow.update({fieldsDictionary[header_row_cleaned[curr_cell]]: str(int(row[curr_cell].value))})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "imei":
                    jsonRow.update({fieldsDictionary[header_row_cleaned[curr_cell]]: str(int(row[curr_cell].value))})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "imsi":
                    jsonRow.update({fieldsDictionary[header_row_cleaned[curr_cell]]: str(int(row[curr_cell].value))})
        
        if "date" in jsonRow.keys() and "time" in jsonRow.keys():
            jsonRow.update({"startTime": datetime(jsonRow["date"].year, jsonRow["date"].month, jsonRow["date"].day, jsonRow["time"].hour, jsonRow["time"].minute, jsonRow["time"].second)})
            jsonRow.update({"endTime": jsonRow["startTime"] + timedelta(seconds=int(jsonRow["callDuration"]))})
            del jsonRow["date"]
            del jsonRow["time"]
        print(jsonRow)
        if jsonRow != {}:
            cdrWriter.writerow(jsonRow)



def parse_csv(file_name, cdrFile):
    cdrFile = open(file_name,'r',newline='')
    csv_reader = csv.reader(cdrFile, delimiter=',')
    header_row, header_row_index = get_csv_header_row(csv_reader)
    header_row_cleaned = [re.sub('[\W_]+', '', x).lower() for x in header_row]
    print(header_row_cleaned)
    csv_reader = list(csv_reader)
    num_rows = len(csv_reader)
    curr_row = header_row_index
    num_cells = len(csv_reader[curr_row])
    while curr_row < num_rows:
        emptyRowPresent = True
        row = csv_reader[curr_row]
        for curr_cell in range(0, min(4, num_cells)):
            if row[curr_cell].strip() != '':
                emptyRowPresent = False
                break
        if emptyRowPresent == True:
            break
        #print(csv_reader[curr_row])
        jsonRow = {}
        for curr_cell in range(num_cells):
            if header_row_cleaned[curr_cell] in fieldsDictionary.keys():
                if fieldsDictionary[header_row_cleaned[curr_cell]] == "callerNumber" or fieldsDictionary[header_row_cleaned[curr_cell]] == "calledNumber":
                    if row[curr_cell].isdigit():
                        jsonRow.update({fieldsDictionary[header_row_cleaned[curr_cell]]: row[curr_cell]})
                    else:
                        break
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "callType":
                    cleaned_val = re.sub('[\W_]+', '',row[curr_cell] ).lower()
                    if cleaned_val == "incoming" or cleaned_val == "in" or cleaned_val == "ic" or cleaned_val=="callin":
                        jsonRow.update({"callType": "in"})
                    elif cleaned_val == "outgoing" or cleaned_val == "out" or cleaned_val == "oc" or cleaned_val=="callout":
                        jsonRow.update({"callType": "out"})
                    elif cleaned_val == "smsincoming" or cleaned_val == "smsin" or cleaned_val == "isms" or cleaned_val=="smt":
                        jsonRow.update({"callType": "smsin"})
                    elif cleaned_val == "smsoutgoing" or cleaned_val == "smsout" or cleaned_val == "osms" or cleaned_val == "smo":
                        jsonRow.update({"callType": "smsout"})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "date":
                    date_list = row[curr_cell].split('-')
                    date_list = [int(x) for x in date_list]
                    jsonRow.update({"date": datetime(date_list[2], date_list[1], date_list[0], 0, 0, 0)})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "time":
                    time_list = row[curr_cell].split(':')
                    time_list = [int(x) for x in time_list]
                    jsonRow.update({"time": datetime(1899, 12, 31, time_list[0], time_list[1], time_list[2])})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "callDuration":
                    jsonRow.update({fieldsDictionary[header_row_cleaned[curr_cell]]: row[curr_cell]})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "imei":
                    jsonRow.update({fieldsDictionary[header_row_cleaned[curr_cell]]: row[curr_cell]})
                elif fieldsDictionary[header_row_cleaned[curr_cell]] == "imsi":
                    jsonRow.update({fieldsDictionary[header_row_cleaned[curr_cell]]: row[curr_cell]})
        
        if "date" in jsonRow.keys() and "time" in jsonRow.keys():
            jsonRow.update({"startTime": datetime(jsonRow["date"].year, jsonRow["date"].month, jsonRow["date"].day, jsonRow["time"].hour, jsonRow["time"].minute, jsonRow["time"].second)})
            jsonRow.update({"endTime": jsonRow["startTime"] + timedelta(seconds=int(jsonRow["callDuration"]))})
            del jsonRow["date"]
            del jsonRow["time"]
        print(jsonRow)
        if jsonRow != {}:
            cdrWriter.writerow(jsonRow)
        curr_row += 1
        

cdrFile = open('cdrDataTemp.csv','w',newline='')
cdrFieldnames = ['callerNumber', 'calledNumber', 'startTime', 'callDuration', 'endTime', 'callType', 'imei', 'imsi']
cdrWriter = csv.DictWriter(cdrFile, fieldnames = cdrFieldnames)
cdrWriter.writeheader()
parse_csv('cdrData.csv', cdrFile)
#parse_csv('919197861937.csv', cdrFile)
#parse_xls('9995448186.xls', cdrFile)