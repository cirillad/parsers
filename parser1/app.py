import random
from time import sleep
import requests
from bs4 import BeautifulSoup
import json
import csv

# url = "https://health-diet.ru/table_calorie/?utm_source=leftMenu&utm_medium=table_calorie"
#
headers = {
    "Accept": "*/*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Sa"
                  "fari/537.36"
}
#
# req = requests.get(url, headers=headers)
# srq = req.text
# # print(srq)
#
# with open("index.html", "w", encoding="utf-8") as file:
#     file.write(srq)

# with open("index.html", encoding="utf-8") as file:
#     src = file.read()
#
# soup = BeautifulSoup(src, "lxml")
# all_products_hrefs = soup.find_all('div', class_="uk-flex mzr-tc-group-item")
#
# all_categories_dict = {}
#
# for item in all_products_hrefs:
#     item_text = item.get_text().strip()
#     item_href = "https://health-diet.ru" + item.find('a')['href']
#     print(f"{item_text}: {item_href}")
#
#     all_categories_dict[item_text] = item_href

# with open("all_categories_dict.json", "w", encoding="utf-8") as file:
#     json.dump(all_categories_dict, file, indent=4, ensure_ascii=False)

with open("all_categories_dict.json", encoding="utf-8") as file:
    all_categories = json.load(file)

iteration_count = int(len(all_categories)) - 1
print(f"Iteration: {iteration_count}")

count = 0

for category_name, category_href in all_categories.items():
    rep = [",", "-", " ", "'"]
    for item in rep:
        if item in category_name:
            category_name = category_name.replace(item, "_")

    req = requests.get(url=category_href, headers=headers)
    src = req.text

    with open(f"data/{count}_{category_name}.html", "w", encoding="utf-8") as file:
        file.write(src)

    with open(f"data/{count}_{category_name}.html", encoding="utf-8") as file:
        src = file.read()

    soup = BeautifulSoup(src, "lxml")

    alert_block = soup.find(
        class_="uk-alert uk-alert-danger uk-h1 uk-text-center mzr-block mzr-grid-3-column-margin-top")
    if alert_block is not None:
        continue

    table_head = soup.find(
        class_="uk-table mzr-tc-group-table uk-table-hover uk-table-striped uk-table-condensed").find("tr").find_all(
        "th")

    product = table_head[0].text
    calories = table_head[1].text
    proteins = table_head[2].text
    fats = table_head[3].text
    carbohydrates = table_head[4].text

    with open(f'data/{count}_{category_name}.csv', 'w', encoding='utf-8-sig', newline='') as file:
        writer = csv.writer(file, delimiter=';')
        writer.writerow(
            (
                product,
                calories,
                proteins,
                fats,
                carbohydrates
            )
        )

    products_data = soup.find(
        class_="uk-table mzr-tc-group-table uk-table-hover uk-table-striped uk-table-condensed").find("tbody").find_all(
        "tr")

    product_info = []

    for item in products_data:
        product_tds = item.find_all("td")

        title = product_tds[0].find("a").text
        calories = product_tds[1].text
        proteins = product_tds[2].text
        fats = product_tds[3].text
        carbohydrates = product_tds[4].text

        product_info.append(
            {
                "Title": title,
                "Calories": calories,
                "Proteins": proteins,
                "Fats": fats,
                "Carbohydrates": carbohydrates
            }
        )

        with open(f'data/{count}_{category_name}.csv', 'a', encoding='utf-8-sig', newline='') as file:
            writer = csv.writer(file, delimiter=';')
            writer.writerow(
                (
                    title,
                    calories,
                    proteins,
                    fats,
                    carbohydrates
                )
            )

    with open(f"data/{count}_{category_name}.json", "a", encoding="utf-8") as file:
        json.dump(product_info, file, indent=4, ensure_ascii=False)

    count += 1
    print(f"Iteration: {iteration_count}. {category_name} done...")
    iteration_count -= 1
    print(iteration_count)

    if iteration_count == 0:
        print("All Done")
        break

    sleep(random.randrange(2, 4))
