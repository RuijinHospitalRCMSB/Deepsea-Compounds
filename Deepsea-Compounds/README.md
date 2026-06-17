# Deepsea-Compounds

Deep Sea Compound Database — Browse 324 deep sea-derived compounds and 80 related targets.

Live: https://ruijinhospitalrcmsb.github.io/Deepsea-Compounds/

## Data Source

- **Source**: Sanya Deep Sea Compound Center
- **Funding**: 2021 Hainan Provincial Major Science and Technology Program (Task: Deep Sea & Hadal Microbial Active Substance Resource Research, No.: ZDKJ2021028)
- **Source Databases**: ChemBL, ZINC, UniProt, TTD, PubMed

## Features

- **Home**: Database overview, global search, statistics
- **Compounds**: 324 compounds, searchable, sortable, CSV export
- **Targets**: 80 related targets, searchable, UniProt links
- **Network**: D3.js chord diagram for target-compound relationships
- **Global Search**: Fuzzy search by compound or target name

## Project Structure

```
Deepsea-Compounds/
├── index.html              # Home page
├── search.html             # Search results
├── network.html            # Association network
├── compounds/
│   └── index.html         # Compound list
├── targets/
│   └── index.html         # Target list
├── assets/
│   ├── data/
│   │   ├── compounds.json     # Compound data
│   │   ├── targets.json       # Target data
│   │   └── associations.json  # Associations
├── parse_data.py           # Data parsing script
└── README.md
```

## Data Update

To regenerate JSON from the original docx files:

```bash
python3 parse_data.py
```

Requires:

```bash
pip install python-docx
```

Edit the file paths in the script to point to your docx files.

## Tech Stack

- Pure frontend static site (no backend)
- Bootstrap 5.1.3 + Font Awesome 6 (CDN)
- D3.js v7 (chord diagram visualization)
- Deployed on GitHub Pages

## Deployment

Deployed on GitHub Pages under the `RuijinHospitalRCMSB` account.

Push to `main` branch and it deploys automatically within ~2 minutes.
