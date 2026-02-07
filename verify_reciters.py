import requests

reciters = {
    'Alafasy_128kbps': 'مشاري العفاسي',
    'Minshawy_Murattal_128kbps': 'محمد صديق المنشاوي',
    'Husary_128kbps': 'محمود خليل الحصري',
    'Abdul_Basit_Murattal_192kbps': 'عبد الباسط عبد الصمد',
    'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net': 'أحمد العجمي',
    'Maher_AlMuaiqly_64kbps': 'ماهر المعيقلي',
    'Yasser_Ad-Dussary_128kbps': 'ياسر الدوسري'
}

base_url = "https://everyayah.com/data/"
test_file = "001001.mp3"

print(f"{'Reciter ID':<50} | {'Status':<10} | {'URL'}")
print("-" * 120)

for reciter_id, name in reciters.items():
    url = f"{base_url}{reciter_id}/{test_file}"
    try:
        response = requests.head(url, timeout=5)
        status = response.status_code
        print(f"{reciter_id:<50} | {status:<10} | {url}")
    except Exception as e:
        print(f"{reciter_id:<50} | {'Error':<10} | {e}")
