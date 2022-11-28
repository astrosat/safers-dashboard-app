import click
import json
import pandas as pd

from collections import OrderedDict, defaultdict

"""
Basic script for taking JSON translation files and converting them into CSV files.
"""

LOCALES = OrderedDict([
    ("en", "english"),
    ("es", "spanish"),
    ("fr", "french"),
    ("it", "italian"),
    ("de", "german"),
])


def import_translations(filename):
    
    translations_data = defaultdict(dict)
    for locale in LOCALES:
        language = LOCALES[locale]
        try:
            fp = open(f"{locale}/{filename}", "r")
            translations = json.load(fp)
            for k, v in translations.items():
                translations_data[k][language] = v
            fp.closed
        except FileNotFoundError as e:
            click.echo(e, err=True)
            continue
    return [
        {
            "code": k,
            **v,
        }
        for k,v in translations_data.items()
    ]
    
@click.command()
@click.option("--input-filename", required=True, type=str)
@click.option("--output-filename", required=True, type=click.Path())
def main(input_filename, output_filename):
    translations_data = import_translations(input_filename)
    df = pd.json_normalize(translations_data)
    df.to_csv(output_filename, sep=";")
    

if __name__ == '__main__':
   main()