import click
import json
import pandas as pd

from collections import OrderedDict, defaultdict

"""
Basic script for taking CSV translation files and converting them into JSON files.
"""

LOCALES = OrderedDict([
    ("en", "english"),
    ("es", "spanish"),
    ("fr", "french"),
    ("it", "italian"),
    ("de", "german"),
    ("el", "greek"),
])


def import_translations(filename, locale):
    
    fp = open(filename, "rb")
    df = pd.read_excel(fp, sheet_name=None)

    translations_data = defaultdict(dict)
    default_langauge = LOCALES["en"]
    language = LOCALES[locale]

    for sheet_key, sheet_values in df.items():                
        translations_data[sheet_key] = {
            row["code"]: row[language] if row[language] else row[default_langauge]
            for _, row in sheet_values.fillna("").iterrows()
        }

    fp.closed

    return translations_data

    
@click.command()
@click.option("--input-filename", required=True, type=str)
@click.option("--locale", required=True, type=click.Choice(LOCALES.keys()))
def main(input_filename, locale):
    translations_data = import_translations(input_filename, locale)
    for k, v in translations_data.items():
        fp = open(f"{k}.json", "w")
        json.dump(v, fp, ensure_ascii=False, indent=2)
        fp.closed
    
if __name__ == '__main__':
   main()