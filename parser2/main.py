import requests
from bs4 import BeautifulSoup
import json
import csv

# persons_url_list = []
#
# for i in range(0, 762, 12):
#     url = f"https://www.bundestag.de/ajax/filterlist/en/members/863330-863330?limit=12&noFilterSet=true&offset={i}"
#
#     req = requests.get(url)
#     result = req.text
#
#     soup = BeautifulSoup(result, "lxml")
#     persons = soup.find_all("a")
#
#     for person in persons:
#         person_page_url = person.get('href')
#         persons_url_list.append(person_page_url)
#
# with open("persons_url_list.txt", "w", encoding="utf-8") as file:
#     for line in persons_url_list:
#         file.write(f"{line}\n")

with open("persons_url_list.txt") as file:
    lines = [line.strip() for line in file.readlines()]

    count = 0
    data_dict = []

    for line in lines:
        q = requests.get(line)
        result = q.text

        soup = BeautifulSoup(result, "lxml")
        person = soup.find(class_="col-xs-8 col-md-9 bt-biografie-name").find("h3").text
        person_name_company = person.strip().split(',')
        person_name = person_name_company[0]
        person_company = person_name_company[1].strip()

        social_networks = soup.find(class_="bt-linkliste")
        links = social_networks.find_all('a')
        social_networks_urls = [link['href'] for link in links[:3]]

        data = {
            'person_name': person_name,
            'company_name':person_company,
            'social_networks': social_networks_urls
        }

        data_dict.append(data)
        count += 1
        print(count)

with open("data.json", "w", encoding="utf-8") as json_file:
    json.dump(data_dict, json_file, indent=4, ensure_ascii=False)

with open("data.csv", "w", newline='', encoding="utf-8") as csv_file:
    fieldnames = ['person_name', 'company_name', 'social_network_1', 'social_network_2', 'social_network_3']
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

    writer.writeheader()
    for data in data_dict:
        writer.writerow({
            'person_name': data['person_name'],
            'company_name': data['company_name'],
            'social_network_1': data['social_networks'][0] if len(data['social_networks']) > 0 else '',
            'social_network_2': data['social_networks'][1] if len(data['social_networks']) > 1 else '',
            'social_network_3': data['social_networks'][2] if len(data['social_networks']) > 2 else ''
        })
