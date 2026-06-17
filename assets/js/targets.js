/* ══════════════════════════════════════════════════════
   Deep-Sea Compound Database — Targets Browse & Detail
   ══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var targets = [];
  var filteredTargets = [];
  var currentPage = 0;
  var pageSize = 30;

  var _cachedData = null;
  var _dataPromise = null;

  function getTargetsData() {
    if (_cachedData) return Promise.resolve(_cachedData);
    if (typeof TARGETS_DATA !== 'undefined' && TARGETS_DATA !== null) {
      _cachedData = TARGETS_DATA;
      return Promise.resolve(TARGETS_DATA);
    }
    if (_dataPromise) return _dataPromise;
    _dataPromise = fetch('../assets/data/targets.json').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      _cachedData = d;
      return d;
    });
    return _dataPromise;
  }

  var CATEGORY_COLORS = {
    'Kinase/Phosphatase': '#e53935',
    'Cytochrome P450': '#fb8c00',
    'ABC Transporter': '#8e24aa',
    'Protease': '#00897b',
    'Oxidoreductase': '#3949ab',
    'Cytoskeletal': '#c0ca33',
    'DNA Topology': '#00acc1',
    'Epigenetic': '#6d4c41',
    'Receptor/Channel': '#d4532a',
    'Other': '#78909c',
  };

  var CHEMOTYPE_COLORS = {
    'Polyketide': '#1565c0', 'Alkaloid': '#2e7d32', 'Terpenoid': '#d4532a',
    'Peptide': '#6a1b9a', 'Phenylpropanoid': '#f9a825',
    'Polyketide-Peptide': '#00695c', 'Alkaloid-Peptide': '#4a148c',
    'Azaphilone': '#e91e63',
  };

  var PROTEIN_FUNCTIONS = {
    'GSK3B': 'Serine-threonine kinase that phosphorylates glycogen synthase and regulates glycogen metabolism. Phosphorylates tau protein, beta-catenin, and numerous transcription factors. Plays central roles in Wnt signaling, insulin signaling, and cell cycle. Hyperactivity contributes to Alzheimer pathology through tau hyperphosphorylation. Considered a target for neurodegenerative diseases, diabetes, and certain cancers.',
    'CDK2': 'Cyclin-dependent kinase controlling G1/S phase transition of the cell cycle. Forms active complexes with cyclins E and A to phosphorylate Rb and other substrates essential for DNA replication. Overexpression and hyperactivation occur in breast, ovarian, and lung cancers. Validated anticancer target with selective inhibitors in clinical development.',
    'EGFR': 'Receptor tyrosine kinase of the ErbB family activating PI3K/AKT, RAS/MAPK, and JAK/STAT pathways. Upon EGF binding, dimerizes and autophosphorylates to drive proliferation, differentiation, and survival. Overexpressed, mutated, or activated in NSCLC, colorectal, head and neck, and glioblastoma. First-generation inhibitors gefitinib and erlotinib transformed EGFR-mutant lung adenocarcinoma treatment.',
    'ACHE': 'Hydrolyzes acetylcholine at cholinergic synapses to terminate neurotransmission. Active site contains a catalytic triad within a deep gorge. Inhibition potentiates cholinergic transmission for symptomatic benefit in Alzheimer disease. Selective ACHE inhibitors (donepezil, rivastigmine, galantamine) are first-line symptomatic therapy for mild to moderate Alzheimer disease.',
    'TOP1': 'Relieves torsional DNA stress during transcription and replication by creating transient single-strand breaks. Camptothecin derivatives (topotecan, irinotecan) trap the TOP1-DNA complex, causing replication fork collision and DNA damage. Sensitivity is enhanced in S-phase cells, providing selectivity for dividing cancer cells.',
    'HSP90AA1': 'Molecular chaperone facilitating folding and stabilization of over 200 client proteins including many oncogenic kinases and transcription factors. Functions as an ATP-dependent homodimer. Client proteins include HER2, BRAF, CDK4, AKT, and steroid receptors. HSP90 inhibition simultaneously destabilizes multiple oncoproteins to overcome therapeutic resistance.',
    'PPARG': 'Nuclear receptor heterodimerizing with RXR-alpha to regulate adipocyte differentiation, glucose homeostasis, and lipid metabolism. Synthetic thiazolidinediones (pioglitazone, rosiglitazone) improve insulin sensitivity in type 2 diabetes. Genetic variants influence metabolic syndrome risk and lipodystrophy.',
    'PTGS2': 'Cyclooxygenase-2 (COX-2) catalyzing prostaglandin biosynthesis from arachidonic acid. Induced by inflammatory cytokines and growth factors. Selective COX-2 inhibitors (celecoxib, etoricoxib) provide anti-inflammatory effects with reduced GI toxicity. Overexpressed in colorectal carcinogenesis. Cardiovascular concerns led to rofecoxib withdrawal.',
    'MAOB': 'Mitochondrial enzyme catalyzing oxidative deamination of dopamine and phenylethylamine. Generates hydrogen peroxide contributing to oxidative stress in aging brain. Expression increases with age. Selective MAOB inhibitors (selegiline, rasagiline, safinamide) are used for Parkinson disease to elevate striatal dopamine.',
    'AR': 'Ligand-activated nuclear transcription factor mediating androgen effects (testosterone, DHT). Drives prostate growth and cancer progression. Androgen deprivation therapy and AR antagonists (enzalutamide, apalutamide, darolutamide) are foundation treatments for advanced prostate cancer.',
    'AKT1': 'Serine-threonine kinase (PKB-alpha) central to the PI3K/AKT/mTOR pathway. Activated by PIP3 leading to phosphorylation at Thr308 and Ser473. Phosphorylates mTORC1, GSK3B, FOXOs, and BAD to promote survival and growth. Hyperactivation through PTEN loss or PIK3CA mutation drives many cancers.',
    'MTOR': 'Serine-threonine kinase forming mTORC1 (protein synthesis, autophagy) and mTORC2 (AKT phosphorylation, cytoskeleton). Integrates growth factor, nutrient, and energy signals. Hyperactivation is frequent in cancer. Rapamycin analogs (everolimus, temsirolimus) are approved for renal cell carcinoma and breast cancer.',
    'VEGFA': 'Key growth factor stimulating angiogenesis through VEGFR-1/2 binding. HIF-1alpha drives expression under hypoxia. Overexpression drives tumor angiogenesis. Bevacizumab (anti-VEGF antibody) and VEGFR TKIs (sunitinib, sorafenib) are anti-angiogenic therapies across multiple cancers.',
    'PARP1': 'Nuclear enzyme catalyzing poly-ADP-ribosylation for DNA damage sensing. Binds single-strand breaks and recruits repair factors. PARP inhibitors (olaparib, niraparib, rucaparib, talazoparib) exploit synthetic lethality in BRCA-deficient tumors. Approved for ovarian, breast, pancreatic, and prostate cancers.',
    'HDAC1': 'Histone deacetylase removing acetyl groups from histones to promote chromatin condensation. Also deacetylates p53, STAT3, and HSP90. Component of Sin3 and NuRD co-repressor complexes. HDAC inhibitors (vorinostat, romidepsin, belinostat) are approved for T-cell lymphomas.',
    'BCL2': 'Anti-apoptotic protein at the mitochondrial outer membrane sequestering pro-apoptotic BH3-only proteins and BAX/BAK. Overexpressed in follicular lymphoma, CLL, and multiple myeloma. The BH3-mimetic venetoclax selectively inhibits BCL2 to restore apoptosis in hematologic malignancies.',
    'SIRT1': 'NAD-dependent deacetylase linking energy status to transcriptional regulation. Deacetylates histones, p53, FOXOs, PGC-1alpha, and NF-kB. Regulates gluconeogenesis and insulin sensitivity. Implicated in aging through caloric restriction response modulation.',
    'DNMT1': 'Maintains DNA methylation patterns during replication by copying marks to daughter strands. Essential for preserving gene expression programs. Aberrant CpG hypermethylation silences tumor suppressors. Hypomethylating agents (azacitidine, decitabine) are standard for MDS and AML.',
    'CTNNB1': 'Transcriptional co-activator of Wnt signaling and cell adhesion regulator. In the absence of Wnt, beta-catenin is degraded by the APC/AXIN/GSK3 complex. Wnt signaling stabilizes beta-catenin for TCF-mediated transcription. Mutations cause constitutive activation in colorectal and other cancers.',
    'SRC': 'Non-receptor tyrosine kinase regulating adhesion, motility, and proliferation through integrin and growth factor signaling. Contains SH2, SH3, and kinase domains. Implicated in cancer metastasis and bone resorption. Dasatinib and bosutinib are Src inhibitors approved for CML.',
    'MMP9': 'Zinc-dependent endopeptidase (gelatinase B) degrading type IV collagen in basement membranes. Secreted as proenzyme activated by proteolytic cleavage. Drives cancer invasion and metastasis. Implicated in rheumatoid arthritis, MS, and atherosclerotic plaque rupture.',
    'MAPK1': 'Serine-threonine kinase (ERK2) downstream of the RAS/RAF/MEK cascade. Phosphorylates ELK1, c-FOS, RSK, and MNK. The RAS-MAPK pathway is the most frequently mutated signaling pathway in cancer. MEK and ERK inhibitors target BRAF-mutant melanoma.',
    'NFE2L2': 'NRF2 transcription factor activating over 200 cytoprotective genes via antioxidant response elements. KEAP1 targets NRF2 for degradation; oxidative stress disrupts this. Protects against carcinogenesis but in cancers confers chemoresistance. NRF2 inhibitors are under development.',
    'CASP3': 'Executioner caspase cleaving cellular proteins during apoptosis. Activated by CASP8/CASP9 through proteolytic processing. Cleaves PARP, nuclear lamins, and ICAD. Defective activation contributes to chemoresistance; excessive activation causes neurodegeneration.',
    'TNF': 'Pro-inflammatory cytokine (TNF-alpha) from activated macrophages regulating immunity and apoptosis. Binds TNFR1 (inflammation) and TNFR2 (survival). Drives rheumatoid arthritis, IBD, and psoriasis. TNF inhibitors (infliximab, adalimumab, etanercept) are blockbuster biologics for autoimmune disease.',
    'IL6': 'Pleiotropic cytokine signaling through JAK/STAT3, MAPK, and PI3K pathways. Regulates B-cell differentiation, T-cell activation, and acute-phase proteins. Drives rheumatoid arthritis and cytokine release syndrome. Tocilizumab (anti-IL-6R) treats RA and CAR-T-induced CRS.',
    'CXCR4': 'Chemokine receptor (GPCR) binding CXCL12 to regulate cell migration and bone marrow homing. Involved in cancer metastasis and HIV-1 entry. The antagonist plerixafor is approved for stem cell mobilization for transplantation.',
    'CCR5': 'Chemokine receptor (GPCR) mediating inflammatory cell recruitment. HIV-1 co-receptor; delta32 homozygotes are HIV-resistant. Maraviroc is approved for HIV treatment. Implicated in autoimmune inflammation and GVHD.',
    'NTRK1': 'Receptor tyrosine kinase for NGF regulating neuronal development. Gene fusions (ETV6, TPM3) create constitutive oncoproteins in rare cancers. TRK inhibitors larotrectinib and entrectinib achieve high response rates in NTRK fusion-positive tumors regardless of tissue origin.',
    'KIT': 'Receptor tyrosine kinase (CD117) for stem cell factor regulating hematopoiesis and melanogenesis. Activating mutations (exon 11) drive gastrointestinal stromal tumors. Imatinib targets mutant KIT in GIST. Secondary mutations require subsequent sunitinib or regorafenib.',
    'MET': 'Receptor tyrosine kinase (HGFR) regulating cell scattering, invasion, and proliferation. Essential for development and organ regeneration. Amplification causes EGFR inhibitor resistance. Tepotinib and capmatinib are approved for MET exon 14-skipping mutant NSCLC.',
    'FGFR1': 'Receptor tyrosine kinase for FGFs regulating proliferation, differentiation, and angiogenesis. Amplified in breast cancer (luminal B) and ovarian cancer. Erdafitinib and pemigatinib are approved for FGFR-altered urothelial carcinoma and cholangiocarcinoma.',
    'IGF1R': 'Receptor tyrosine kinase for IGF-1/2 activating PI3K/AKT and RAS/MAPK pathways. Crucial for growth and development. Hyperactivated in cancers and mediates resistance to EGFR/HER2 targeted therapies.',
    'VDR': 'Nuclear receptor for vitamin D3 regulating calcium homeostasis, bone metabolism, and immune function. Heterodimerizes with RXR. VDR polymorphisms influence osteoporosis and autoimmune disease susceptibility. Vitamin D analogs treat osteoporosis and psoriasis.',
    'ESR1': 'Estrogen receptor alpha driving luminal breast cancers. Endocrine therapies include SERMs (tamoxifen), aromatase inhibitors (letrozole), and SERDs (fulvestrant). ESR1 mutations (Y537S, D538G) emerge under therapy pressure causing endocrine resistance.',
    'GABRG2': 'Gamma-2 subunit of GABA-A receptor chloride channels mediating fast inhibitory neurotransmission. Essential for benzodiazepine modulation. GABRG2 mutations cause Dravet syndrome and childhood absence epilepsy.',
    'HTR2A': 'Serotonin 2A receptor (GPCR) mediating excitatory neurotransmission via phospholipase C. Highly expressed in prefrontal cortex. Target of classical psychedelics (LSD, psilocybin) and atypical antipsychotics. Psilocybin shows promise for treatment-resistant depression.',
    'ADRB2': 'Beta-2 adrenergic receptor (GPCR) stimulating Gs-cAMP signaling causing bronchodilation. Target of beta-2 agonists (albuterol, salmeterol) for asthma and COPD. Polymorphisms affect bronchodilator response. Prolonged activation causes receptor desensitization.',
    'DRD2': 'Dopamine D2 receptor (GPCR) regulating movement, motivation, and reward. Primary target of antipsychotics. Blockade in mesolimbic pathway mediates efficacy; striatal blockade causes extrapyramidal side effects. Target of dopamine agonists for Parkinson disease.',
    'OPRM1': 'Mu-opioid receptor (GPCR) mediating analgesia and respiratory depression of opioids. Gi/o-coupled inhibiting adenylyl cyclase. Target of morphine, fentanyl, and oxycodone. Also mediates tolerance, dependence, and opioid use disorder.',
    'SLC6A4': 'Serotonin transporter (SERT) terminating serotonergic neurotransmission by reuptake. Primary target of SSRIs (fluoxetine, sertraline, escitalopram) as first-line antidepressants. Promoter polymorphisms affect anxiety traits and antidepressant treatment response.',
    'CNR1': 'Cannabinoid receptor 1 (GPCR) mediating THC psychoactive effects. Highly expressed in CNS regulating appetite, pain, and memory. Endocannabinoids (anandamide, 2-AG) are endogenous ligands. CB1 antagonist rimonabant was withdrawn due to psychiatric side effects.',
    'CFTR': 'Chloride ion channel and ABC transporter regulating epithelial fluid secretion. Mutations cause cystic fibrosis (F508del causes misfolding). CFTR modulators (ivacaftor, lumacaftor, elexacaftor) correct folding and potentiate channel function to improve outcomes.',
    'SCN5A': 'Voltage-gated sodium channel (Nav1.5) generating cardiac action potential depolarization. Loss-of-function causes Brugada syndrome; gain-of-function causes long QT type 3. Target of Class I antiarrhythmics (lidocaine, flecainide).',
    'KCNH2': 'Voltage-gated potassium channel (hERG/Kv11.1) conducting IKr for cardiac repolarization. Most common off-target for drug-induced QT prolongation, making it mandatory in safety screening. Loss-of-function causes long QT syndrome type 2.',
    'CACNA1C': 'L-type calcium channel (Cav1.2) mediating calcium influx for cardiac contraction. Target of calcium channel blockers (verapamil, nifedipine) for hypertension. Polymorphisms associate with bipolar disorder and schizophrenia risk.',
    'GRIN1': 'Essential GluN1 subunit of NMDA glutamate receptors. These calcium-permeable channels require glutamate and glycine for activation and are critical for synaptic plasticity. Overactivation causes excitotoxicity in stroke and neurodegeneration.',
    'GABRA1': 'Most abundant GABA-A receptor alpha subunit mediating fast inhibitory transmission. Mediates sedative and anticonvulsant effects of benzodiazepines. GABRA1 mutations cause juvenile myoclonic epilepsy.',
    'CHRM2': 'Muscarinic M2 receptor (Gi/o) slowing heart rate and reducing atrial contractility. Highly expressed in heart and brain. M2 antagonists are explored for Alzheimer disease to enhance cholinergic transmission.',
    'HRH1': 'Histamine H1 receptor (GPCR) mediating allergic and inflammatory responses. H1 antihistamines (cetirizine, loratadine, fexofenadine) are widely used for allergic rhinitis. First-generation drugs cross the BBB causing sedation.',
    'PDE5A': 'cGMP-specific phosphodiesterase in vascular smooth muscle. Inhibition elevates cGMP promoting vasodilation. Sildenafil and tadalafil treat erectile dysfunction and pulmonary hypertension by enhancing NO/cGMP signaling.',
    'CYP3A4': 'Major CYP metabolizing ~50% of marketed drugs. Highly expressed in liver and intestine. Induced by rifampicin, inhibited by ketoconazole and grapefruit juice. Most important enzyme for drug-drug interaction assessment.',
    'CYP2D6': 'CYP metabolizing 20-25% of drugs despite ~2% of hepatic CYP. Over 100 variants produce four metabolizer phenotypes. Substrates include antidepressants, beta-blockers, and codeine. Genotyping increasingly guides pharmacotherapy.',
    'CYP1A1': 'Extrahepatic CYP metabolizing PAHs and estrogens. Induced by cigarette smoke through AhR. Involved in procarcinogen activation. Polymorphisms associate with lung cancer susceptibility in smokers.',
    'ABCB1': 'P-glycoprotein (MDR1), ATP-dependent efflux transporter. Highly expressed at intestine, BBB, and liver. Major contributor to multidrug resistance in cancer chemotherapy. Determines oral bioavailability and CNS drug penetration.',
    'ABCC1': 'Multidrug resistance-associated protein 1 (MRP1) effluxing organic anions and glutathione conjugates. Widely expressed, contributes to anthracycline and etoposide efflux. Transports leukotriene C4 in inflammatory responses.',
    'ABCG2': 'Breast cancer resistance protein (BCRP) effluxing chemotherapeutics (mitoxantrone, topotecan). Q141K polymorphism reduces function and increases drug toxicity. Highly expressed at placenta and intestinal epithelium.',
    'TUBB': 'Beta-tubulin forming microtubules essential for cell division and transport. Target of taxanes (paclitaxel, docetaxel) which stabilize microtubules, and vinca alkaloids which inhibit polymerization. Mutations can confer drug resistance.',
    'ACTB': 'Beta-actin forming microfilaments for cell structure, motility, and division. Also functions in nuclear chromatin remodeling. Commonly used as Western blot loading control. Mutations cause rare neutrophil dysfunction disorder.',
    'TERT': 'Telomerase reverse transcriptase maintaining telomere length. Reactivated in ~90% of cancers enabling unlimited proliferation. Promoter mutations (C228T, C250T) are common in melanoma and glioblastoma. Target of the telomerase inhibitor imetelstat.',
    'NPM1': 'Nucleophosmin involved in ribosome biogenesis, centrosome duplication, and tumor suppression. Shuttles between nucleolus and cytoplasm. NPM1 mutations causing cytoplasmic delocalization are the most common genetic alteration in adult AML.',
    'P53': 'Tumor suppressor integrating stress signals for cell cycle arrest, DNA repair, apoptosis, and senescence. Most frequently mutated gene in human cancer (>50% of malignancies). Restoring p53 function with small molecule activators (APR-246) and MDM2 inhibitors represents a major therapeutic strategy.',
  };  var NAME_FUNCTIONS = {
    'Glycogen synthase kinase-3': 'Serine-threonine kinase involved in glycogen metabolism, Wnt signaling, and tau phosphorylation. Regulates cell cycle, apoptosis, and insulin signaling. Key target in Alzheimer disease and cancer.',
    'Amyloid-beta precursor': 'Transmembrane protein that generates amyloid-beta peptides implicated in Alzheimer disease pathology. Involved in synaptic formation and neural plasticity.',
    'Microtubule-associated protein tau': 'Promotes microtubule assembly and stability. Hyperphosphorylation causes neurofibrillary tangles in Alzheimer disease and tauopathies.',
    'Acetylcholinesterase': 'Hydrolyzes acetylcholine at cholinergic synapses to terminate neurotransmission. Primary target for Alzheimer disease symptomatic treatment and myasthenia gravis.',
    'Heat shock protein HSP 90': 'Molecular chaperone that facilitates protein folding, maturation, and stabilization of client proteins including many oncogenic kinases. Therapeutic target in cancer.',
    'Tyrosyl-DNA phosphodiesterase': 'Repair enzyme that removes covalent topoisomerase I-DNA complexes. Involved in DNA damage repair. Target of topoisomerase inhibitor combination therapy.',
    'Cyclooxygenase': 'Converts arachidonic acid to prostaglandins mediating inflammation and pain. Target of NSAIDs and selective COX-2 inhibitors. Two isoforms: COX-1 (constitutive) and COX-2 (inducible).',
    'Estrogen receptor': 'Nuclear receptor that regulates gene expression for female reproductive development and function. Key therapeutic target in breast cancer. Two subtypes: ER-alpha and ER-beta.',
    'Androgen receptor': 'Nuclear receptor that regulates gene expression for male sexual development and prostate growth. Key therapeutic target in prostate cancer.',
    'Histone deacetylase': 'Removes acetyl groups from histone tails, regulating chromatin structure and gene expression. Involved in cell cycle regulation and differentiation. Target of HDAC inhibitor anticancer agents.',
    'DNA topoisomerase': 'Relieves supercoiling during DNA transcription and replication by cleaving and religating DNA strands. Target of topoisomerase inhibitor chemotherapeutics.',
    'Telomerase reverse transcriptase': 'Catalytic subunit of telomerase that maintains telomere length. Reactivated in most cancers to enable unlimited proliferation.',
    'Multidrug resistance-associated protein': 'ATP-binding cassette transporter that effluxes organic anions and glutathione conjugates. Implicated in chemotherapy resistance.',
    'P-glycoprotein': 'ATP-dependent efflux transporter that pumps drugs out of cells. Major contributor to multidrug resistance in cancer chemotherapy.',
    'Breast cancer resistance protein': 'ATP-binding cassette half-transporter that transports various chemotherapeutics and endogenous compounds. Involved in drug disposition and resistance.',
    'Monoamine oxidase': 'Mitochondrial enzyme that catalyzes oxidative deamination of biogenic amines and neurotransmitters. Involved in dopamine and serotonin metabolism. Target of MAO inhibitor antidepressants.',
    'Cytochrome P450': 'Major drug-metabolizing enzyme family that oxidizes xenobiotics and endogenous compounds. Genetic polymorphisms affect drug response and toxicity.',
    'DNA methyltransferase': 'Catalyzes DNA methylation at CpG islands to regulate gene expression. Aberrant methylation contributes to cancer gene silencing. Target of hypomethylating agents.',
    'Matrix metalloproteinase': 'Zinc-dependent endopeptidase that degrades extracellular matrix components. Involved in tissue remodeling, inflammation, and cancer invasion and metastasis.',
    'Tumor suppressor': 'Key regulator of cell cycle arrest, apoptosis, senescence, and DNA repair. Most frequently mutated gene in human cancers. Guardian of the genome.',
    'Beta-tubulin': 'Forms microtubules essential for cell division and intracellular transport. Target of taxane and vinca alkaloid chemotherapeutics.',
    'Beta-actin': 'Major cytoskeletal protein that forms microfilaments essential for cell structure, motility, and division. Commonly used as loading control in biochemical assays.',
    'Nucleophosmin': 'Multifunctional protein involved in ribosome biogenesis, centrosome duplication, and tumor suppression. Frequently mutated in acute myeloid leukemia.',
    'Cannabinoid receptor': 'G protein-coupled receptor that mediates effects of endocannabinoids and phytocannabinoids. Regulates appetite, pain sensation, mood, and memory. Target of rimonabant and dronabinol.',
    'GABA(A) receptor': 'Ligand-gated chloride channel that mediates fast inhibitory neurotransmission in the CNS. Target of benzodiazepines, barbiturates, neurosteroids, and general anesthetics.',
    'NMDA receptor': 'Ionotropic glutamate receptor that mediates slow excitatory neurotransmission. Critical for synaptic plasticity and learning. Target in neurological and psychiatric disorders.',
    'Dopamine receptor': 'G protein-coupled receptor that regulates movement, motivation, reward, and hormone secretion. Primary target of antipsychotic and anti-Parkinson medications.',
    'Serotonin': 'G protein-coupled receptor that mediates excitatory neurotransmission. Regulates mood, cognition, and perception. Target of atypical antipsychotics and psychedelics.',
    'Opioid receptor': 'G protein-coupled receptor that mediates analgesia, reward, and respiratory depression. Target of morphine, fentanyl, and other opioid analgesics.',
    'Chemokine receptor': 'G protein-coupled receptor that regulates immune cell migration and homing. Involved in inflammation, cancer metastasis, and HIV entry.',
    'Vascular endothelial growth factor': 'Key growth factor that stimulates angiogenesis and vascular permeability. Mediator of tumor angiogenesis and macular degeneration. Target of anti-angiogenic therapies.',
    'Insulin-like growth factor': 'Receptor tyrosine kinase that mediates growth hormone signaling. Promotes cell growth, survival, and metabolism. Involved in cancer and growth disorders.',
    'Fibroblast growth factor': 'Receptor tyrosine kinase that regulates cell proliferation, differentiation, and angiogenesis. Mutations cause skeletal disorders. Therapeutic target in cancer.',
  };

  var KEGG_PATHWAYS = {
    'GSK3B': ['hsa04910:Insulin signaling pathway', 'hsa04151:PI3K-Akt signaling pathway', 'hsa04370:VEGF signaling pathway', 'hsa04010:MAPK signaling pathway', 'hsa04310:Wnt signaling pathway'],
    'CDK2': ['hsa04110:Cell cycle', 'hsa04114:Oocyte meiosis', 'hsa04914:Progesterone-mediated oocyte maturation'],
    'EGFR': ['hsa04012:ErbB signaling pathway', 'hsa04151:PI3K-Akt signaling pathway', 'hsa04010:MAPK signaling pathway', 'hsa05200:Pathways in cancer', 'hsa05212:Pancreatic cancer'],
    'ACHE': ['hsa04725:Cholinergic synapse', 'hsa04080:Neuroactive ligand-receptor interaction'],
    'TOP1': ['hsa03030:DNA replication', 'hsa03420:Nucleotide excision repair'],
    'HSP90AA1': ['hsa04662:B cell receptor signaling pathway', 'hsa04660:T cell receptor signaling pathway', 'hsa04722:Neurotrophin signaling pathway'],
    'PPARG': ['hsa03320:PPAR signaling pathway', 'hsa04920:Adipocytokine signaling pathway', 'hsa04931:Insulin resistance'],
    'PTGS2': ['hsa04726:Serotonergic synapse', 'hsa00590:Arachidonic acid metabolism', 'hsa05145:Toxoplasmosis'],
    'MAOB': ['hsa00380:Tryptophan metabolism', 'hsa00260:Glycine, serine and threonine metabolism'],
    'AR': ['hsa04915:Estrogen signaling pathway', 'hsa05204:Chemical carcinogenesis', 'hsa05215:Prostate cancer'],
    'AKT1': ['hsa04151:PI3K-Akt signaling pathway', 'hsa04068:FoxO signaling pathway', 'hsa04150:mTOR signaling pathway', 'hsa05200:Pathways in cancer'],
    'MTOR': ['hsa04150:mTOR signaling pathway', 'hsa04151:PI3K-Akt signaling pathway', 'hsa04211:Longevity regulating pathway'],
    'VEGFA': ['hsa04370:VEGF signaling pathway', 'hsa04068:FoxO signaling pathway', 'hsa04151:PI3K-Akt signaling pathway'],
    'PARP1': ['hsa03460:Fanconi anemia pathway', 'hsa03410:Base excision repair', 'hsa05206:MicroRNAs in cancer'],
    'HDAC1': ['hsa05034:Alcoholism', 'hsa05202:Transcriptional misregulation in cancer', 'hsa05206:MicroRNAs in cancer'],
    'BCL2': ['hsa04210:Apoptosis', 'hsa04151:PI3K-Akt signaling pathway', 'hsa05200:Pathways in cancer', 'hsa04215:Apoptosis - multiple species'],
    'SIRT1': ['hsa04068:FoxO signaling pathway', 'hsa04211:Longevity regulating pathway', 'hsa04150:mTOR signaling pathway'],
    'DNMT1': ['hsa05206:MicroRNAs in cancer', 'hsa05202:Transcriptional misregulation in cancer', 'hsa05034:Alcoholism'],
    'CTNNB1': ['hsa04310:Wnt signaling pathway', 'hsa04520:Adherens junction', 'hsa05200:Pathways in cancer', 'hsa05217:Basal cell carcinoma'],
    'SRC': ['hsa04520:Adherens junction', 'hsa04660:T cell receptor signaling pathway', 'hsa04015:Rap1 signaling pathway', 'hsa04810:Regulation of actin cytoskeleton'],
    'MMP9': ['hsa05205:Proteoglycans in cancer', 'hsa04937:Age-rage signaling pathway', 'hsa05165:Human papillomavirus infection'],
    'MAPK1': ['hsa04010:MAPK signaling pathway', 'hsa04014:Ras signaling pathway', 'hsa04015:Rap1 signaling pathway', 'hsa04370:VEGF signaling pathway'],
    'NFE2L2': ['hsa05215:Prostate cancer', 'hsa04213:Longevity regulating pathway - multiple species', 'hsa05031:Amphetamine addiction'],
    'CASP3': ['hsa04210:Apoptosis', 'hsa05034:Alcoholism', 'hsa05145:Toxoplasmosis', 'hsa05200:Pathways in cancer'],
    'TNF': ['hsa04668:TNF signaling pathway', 'hsa04064:NF-kappa B signaling pathway', 'hsa04217:Necroptosis', 'hsa05323:Rheumatoid arthritis'],
    'IL6': ['hsa04630:JAK-STAT signaling pathway', 'hsa04659:Th17 cell differentiation', 'hsa04064:NF-kappa B signaling pathway', 'hsa05321:Inflammatory bowel disease'],
    'CXCR4': ['hsa04062:Chemokine signaling pathway', 'hsa05162:Measles', 'hsa05170:Human immunodeficiency virus 1 infection'],
    'CCR5': ['hsa04062:Chemokine signaling pathway', 'hsa05162:Measles', 'hsa05170:Human immunodeficiency virus 1 infection'],
    'NTRK1': ['hsa04722:Neurotrophin signaling pathway', 'hsa04010:MAPK signaling pathway', 'hsa04728:Dopaminergic synapse'],
    'KIT': ['hsa04664:FC epsilon RI signaling pathway', 'hsa04380:Osteoclast differentiation', 'hsa04940:Type I diabetes mellitus'],
    'MET': ['hsa04068:FoxO signaling pathway', 'hsa04510:Focal adhesion', 'hsa05200:Pathways in cancer'],
    'FGFR1': ['hsa04010:MAPK signaling pathway', 'hsa05205:Proteoglycans in cancer', 'hsa04151:PI3K-Akt signaling pathway'],
    'IGF1R': ['hsa04151:PI3K-Akt signaling pathway', 'hsa04910:Insulin signaling pathway', 'hsa04068:FoxO signaling pathway'],
    'VDR': ['hsa03320:PPAR signaling pathway', 'hsa04920:Adipocytokine signaling pathway', 'hsa04975:Fat digestion and absorption'],
    'ESR1': ['hsa04915:Estrogen signaling pathway', 'hsa05215:Prostate cancer', 'hsa05224:Breast cancer', 'hsa05205:Proteoglycans in cancer'],
    'GABRG2': ['hsa04727:GABAergic synapse', 'hsa05032:Morphine addiction', 'hsa05034:Alcoholism', 'hsa04080:Neuroactive ligand-receptor interaction'],
    'HTR2A': ['hsa04726:Serotonergic synapse', 'hsa04080:Neuroactive ligand-receptor interaction', 'hsa05031:Amphetamine addiction'],
    'ADRB2': ['hsa04024:cAMP signaling pathway', 'hsa04261:Adrenergic signaling in cardiomyocytes', 'hsa04080:Neuroactive ligand-receptor interaction'],
    'DRD2': ['hsa04728:Dopaminergic synapse', 'hsa05030:Cocaine addiction', 'hsa05031:Amphetamine addiction', 'hsa04080:Neuroactive ligand-receptor interaction'],
    'OPRM1': ['hsa05032:Morphine addiction', 'hsa04080:Neuroactive ligand-receptor interaction', 'hsa04728:Dopaminergic synapse'],
    'SLC6A4': ['hsa04726:Serotonergic synapse', 'hsa05030:Cocaine addiction', 'hsa05031:Amphetamine addiction'],
    'CNR1': ['hsa04723:Retrograde endocannabinoid signaling', 'hsa04080:Neuroactive ligand-receptor interaction'],
    'CFTR': ['hsa04976:Bile secretion', 'hsa04966:Collecting duct acid secretion', 'hsa05310:Asthma'],
    'SCN5A': ['hsa04261:Adrenergic signaling in cardiomyocytes', 'hsa05414:Dilated cardiomyopathy', 'hsa05412:Arrhythmogenic right ventricular cardiomyopathy'],
    'KCNH2': ['hsa04261:Adrenergic signaling in cardiomyocytes', 'hsa05414:Dilated cardiomyopathy'],
    'CACNA1C': ['hsa04080:Neuroactive ligand-receptor interaction', 'hsa04261:Adrenergic signaling in cardiomyocytes', 'hsa04724:Glutamatergic synapse'],
    'GRIN1': ['hsa04724:Glutamatergic synapse', 'hsa04720:Long-term potentiation', 'hsa05030:Cocaine addiction', 'hsa05031:Amphetamine addiction'],
    'GABRA1': ['hsa04727:GABAergic synapse', 'hsa05032:Morphine addiction', 'hsa05034:Alcoholism'],
    'CHRM2': ['hsa04725:Cholinergic synapse', 'hsa04024:cAMP signaling pathway', 'hsa04261:Adrenergic signaling in cardiomyocytes'],
    'HRH1': ['hsa04080:Neuroactive ligand-receptor interaction', 'hsa05322:Systemic lupus erythematosus'],
    'PDE5A': ['hsa04022:cGMP-PKG signaling pathway', 'hsa04270:Vascular smooth muscle contraction', 'hsa04912:GnRH signaling pathway'],
    'CYP3A4': ['hsa00980:Metabolism of xenobiotics by cytochrome P450', 'hsa00982:Drug metabolism - cytochrome P450', 'hsa05204:Chemical carcinogenesis'],
    'CYP2D6': ['hsa00980:Metabolism of xenobiotics by cytochrome P450', 'hsa00982:Drug metabolism - cytochrome P450'],
    'CYP1A1': ['hsa00980:Metabolism of xenobiotics by cytochrome P450', 'hsa05204:Chemical carcinogenesis', 'hsa00380:Tryptophan metabolism'],
    'ABCB1': ['hsa02010:ABC transporters', 'hsa05206:MicroRNAs in cancer', 'hsa04976:Bile secretion'],
    'ABCC1': ['hsa02010:ABC transporters', 'hsa05206:MicroRNAs in cancer'],
    'ABCG2': ['hsa02010:ABC transporters', 'hsa05206:MicroRNAs in cancer'],
    'TUBB': ['hsa04540:Gap junction', 'hsa04810:Regulation of actin cytoskeleton', 'hsa05131:Shigellosis'],
    'TERT': ['hsa04218:Cellular senescence', 'hsa05206:MicroRNAs in cancer', 'hsa05222:Small cell lung cancer'],
    'P53': ['hsa04115:p53 signaling pathway', 'hsa04210:Apoptosis', 'hsa04218:Cellular senescence', 'hsa05200:Pathways in cancer', 'hsa05203:Viral carcinogenesis'],
    'NPM1': ['hsa03008:Ribosome biogenesis in eukaryotes', 'hsa05202:Transcriptional misregulation in cancer', 'hsa05203:Viral carcinogenesis'],
  };

  var NAME_KEGG = {
    'Glycogen synthase kinase-3': ['hsa04910:Insulin signaling pathway', 'hsa04151:PI3K-Akt signaling pathway', 'hsa04370:VEGF signaling pathway', 'hsa04010:MAPK signaling pathway', 'hsa04310:Wnt signaling pathway'],
    'Amyloid-beta precursor': ['hsa05010:Alzheimer disease', 'hsa04210:Apoptosis', 'hsa04722:Neurotrophin signaling pathway'],
    'Microtubule-associated protein tau': ['hsa05010:Alzheimer disease', 'hsa05016:Huntington disease', 'hsa05014:Amyotrophic lateral sclerosis'],
    'Acetylcholinesterase': ['hsa04725:Cholinergic synapse', 'hsa04080:Neuroactive ligand-receptor interaction'],
    'Heat shock protein HSP 90': ['hsa04662:B cell receptor signaling pathway', 'hsa04660:T cell receptor signaling pathway', 'hsa05200:Pathways in cancer'],
    'Cyclooxygenase': ['hsa04726:Serotonergic synapse', 'hsa00590:Arachidonic acid metabolism', 'hsa05145:Toxoplasmosis'],
    'Estrogen receptor': ['hsa04915:Estrogen signaling pathway', 'hsa05215:Prostate cancer', 'hsa05224:Breast cancer'],
    'Androgen receptor': ['hsa04915:Estrogen signaling pathway', 'hsa05204:Chemical carcinogenesis', 'hsa05215:Prostate cancer'],
    'Histone deacetylase': ['hsa05034:Alcoholism', 'hsa05202:Transcriptional misregulation in cancer', 'hsa05206:MicroRNAs in cancer'],
    'DNA topoisomerase': ['hsa03030:DNA replication', 'hsa03420:Nucleotide excision repair'],
    'Telomerase reverse transcriptase': ['hsa04218:Cellular senescence', 'hsa05206:MicroRNAs in cancer', 'hsa05222:Small cell lung cancer'],
    'Monoamine oxidase': ['hsa00380:Tryptophan metabolism', 'hsa00260:Glycine, serine and threonine metabolism'],
    'Cytochrome P450': ['hsa00980:Metabolism of xenobiotics by cytochrome P450', 'hsa00982:Drug metabolism - cytochrome P450', 'hsa05204:Chemical carcinogenesis'],
    'DNA methyltransferase': ['hsa05206:MicroRNAs in cancer', 'hsa05202:Transcriptional misregulation in cancer', 'hsa05034:Alcoholism'],
    'Matrix metalloproteinase': ['hsa05205:Proteoglycans in cancer', 'hsa04937:AGE-RAGE signaling pathway', 'hsa05165:Human papillomavirus infection'],
    'Tumor suppressor': ['hsa04115:p53 signaling pathway', 'hsa04210:Apoptosis', 'hsa04218:Cellular senescence', 'hsa05200:Pathways in cancer'],
    'Beta-tubulin': ['hsa04540:Gap junction', 'hsa04810:Regulation of actin cytoskeleton', 'hsa05131:Shigellosis'],
    'Nucleophosmin': ['hsa03008:Ribosome biogenesis in eukaryotes', 'hsa05202:Transcriptional misregulation in cancer'],
    'Cannabinoid receptor': ['hsa04723:Retrograde endocannabinoid signaling', 'hsa04080:Neuroactive ligand-receptor interaction'],
    'GABA(A) receptor': ['hsa04727:GABAergic synapse', 'hsa05032:Morphine addiction', 'hsa05034:Alcoholism'],
    'NMDA receptor': ['hsa04724:Glutamatergic synapse', 'hsa04720:Long-term potentiation', 'hsa05030:Cocaine addiction'],
    'Dopamine receptor': ['hsa04728:Dopaminergic synapse', 'hsa05030:Cocaine addiction', 'hsa05031:Amphetamine addiction'],
    'Serotonin': ['hsa04726:Serotonergic synapse', 'hsa04080:Neuroactive ligand-receptor interaction', 'hsa05031:Amphetamine addiction'],
    'Opioid receptor': ['hsa05032:Morphine addiction', 'hsa04080:Neuroactive ligand-receptor interaction', 'hsa04728:Dopaminergic synapse'],
    'Chemokine receptor': ['hsa04062:Chemokine signaling pathway', 'hsa05162:Measles', 'hsa05170:Human immunodeficiency virus 1 infection'],
    'Vascular endothelial growth factor': ['hsa04370:VEGF signaling pathway', 'hsa04068:FoxO signaling pathway', 'hsa04151:PI3K-Akt signaling pathway'],
    'Insulin-like growth factor': ['hsa04151:PI3K-Akt signaling pathway', 'hsa04910:Insulin signaling pathway', 'hsa04068:FoxO signaling pathway'],
    'Fibroblast growth factor': ['hsa04010:MAPK signaling pathway', 'hsa05205:Proteoglycans in cancer', 'hsa04151:PI3K-Akt signaling pathway'],
    'Multidrug resistance-associated protein': ['hsa02010:ABC transporters', 'hsa05206:MicroRNAs in cancer'],
    'P-glycoprotein': ['hsa02010:ABC transporters', 'hsa05206:MicroRNAs in cancer', 'hsa04976:Bile secretion'],
    'Breast cancer resistance protein': ['hsa02010:ABC transporters', 'hsa05206:MicroRNAs in cancer'],
    'Beta-actin': [],
    'Tyrosyl-DNA phosphodiesterase': ['hsa03420:Nucleotide excision repair'],
    'Peroxisome proliferator-activated': ['hsa03320:PPAR signaling pathway', 'hsa04920:Adipocytokine signaling pathway', 'hsa04931:Insulin resistance'],
  };

  var CATEGORY_THERAPY = {
    'Kinase/Phosphatase': 'Therapeutic relevance: Protein kinases constitute one of the most intensively pursued drug target families. Over 80 kinase inhibitors have received FDA approval for indications spanning oncology, immunology, and inflammatory diseases. Deregulated kinase activity drives many diseases including cancer, rheumatoid arthritis, and neurodegenerative disorders.',
    'Protease': 'Therapeutic relevance: Proteases are clinically validated drug targets for antiviral therapy (HIV protease inhibitors, SARS-CoV-2 Mpro), cardiovascular disease (ACE inhibitors, renin inhibitors), and metabolic disorders (DPP-4 inhibitors for type 2 diabetes). They regulate critical proteolytic cascades in coagulation, immunity, apoptosis, and extracellular matrix remodeling.',
    'Oxidoreductase': 'Therapeutic relevance: Oxidoreductases represent important targets for metabolic disorders, infectious diseases, and cancer therapy. They catalyze electron transfer reactions essential for cellular respiration, drug metabolism, redox homeostasis, and antioxidant defense mechanisms.',
    'Cytochrome P450': 'Therapeutic relevance: Cytochrome P450 enzymes metabolize approximately 75% of all marketed drugs. They are critical for predicting drug-drug interactions, prodrug activation strategies, and understanding inter-individual variability in drug response caused by genetic polymorphisms (e.g., CYP2D6, CYP2C19).',
    'Epigenetic': 'Therapeutic relevance: Epigenetic targets including histone deacetylases (HDACs), DNA methyltransferases (DNMTs), and bromodomain-containing proteins have yielded approved drugs for hematologic malignancies. HDAC inhibitors such as vorinostat and romidepsin are standard therapies for cutaneous T-cell lymphoma.',
    'Receptor/Channel': 'Therapeutic relevance: Ion channels and G protein-coupled receptors represent the single largest class of approved drug targets, with approximately 35% of all FDA-approved drugs modulating their function. They govern neurotransmission, cardiac excitability, sensory transduction, endocrine signaling, and immune responses across all therapeutic areas.',
    'ABC Transporter': 'Therapeutic relevance: ABC transporters are major determinants of drug absorption, distribution, and elimination. P-glycoprotein (ABCB1/MDR1)-mediated efflux represents a principal mechanism of multidrug resistance in cancer chemotherapy, making these transporters critical for overcoming treatment failure.',
    'DNA Topology': 'Therapeutic relevance: DNA topoisomerases are clinically validated chemotherapeutic targets. Topoisomerase inhibitors such as topotecan, irinotecan (TOP1), and etoposide (TOP2) are frontline treatments for multiple cancer types, exploiting the vulnerability of rapidly dividing cells to DNA damage.',
    'Cytoskeletal': 'Therapeutic relevance: Microtubule dynamics are among the most successful targets for cancer chemotherapy. Taxanes (paclitaxel, docetaxel, cabazitaxel) stabilize microtubules, while vinca alkaloids promote disassembly — both disrupt mitotic spindle formation in dividing cancer cells.',
    'Chaperone': 'Therapeutic relevance: Molecular chaperones such as HSP90 are emerging therapeutic targets in oncology. HSP90 inhibitors simultaneously destabilize multiple oncogenic client proteins, offering a strategy to overcome resistance to single-agent targeted therapies.',
    'DNA Repair': 'Therapeutic relevance: DNA repair pathways are important cancer therapeutic targets. PARP inhibitors exploit synthetic lethality in BRCA-deficient tumors, while inhibitors of DNA damage response kinases (ATM, ATR, CHK1) are under active clinical investigation.',
    'Transcription Factor': 'Therapeutic relevance: Transcription factors have historically been considered difficult drug targets due to their lack of conventional binding pockets. However, strategies targeting protein-protein interactions and proteolysis-targeting chimeras (PROTACs) are opening new therapeutic opportunities.',
    'Metabolic Enzyme': 'Therapeutic relevance: Metabolic enzymes are increasingly important targets for cancer therapy (mutant IDH inhibitors), metabolic diseases (HMG-CoA reductase/statins), and rare genetic disorders. Altered cellular metabolism is a hallmark of cancer, presenting multiple therapeutic opportunities.',
  };

  var DISEASE_DATA = {
    'APP': { diseases: ['Alzheimer disease', 'Cerebral amyloid angiopathy', 'Down syndrome'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Aducanumab (anti-Aβ)', 'Lecanemab (anti-Aβ)'], category: 'Neurodegeneration' },
    'MAPT': { diseases: ['Alzheimer disease', 'Frontotemporal dementia', 'Progressive supranuclear palsy', 'Corticobasal degeneration'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Neurodegeneration' },
    'ACHE': { diseases: ['Alzheimer disease', 'Myasthenia gravis', 'Glaucoma'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Donepezil', 'Rivastigmine', 'Galantamine'], category: 'Hydrolase' },
    'BCHE': { diseases: ['Alzheimer disease (biomarker)', 'Organophosphate poisoning', 'Liver disease'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Hydrolase' },
    'HSP90AA1': { diseases: ['Cancer (multiple types)', 'Neurodegenerative disease'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Chaperone' },
    'HSP90AB1': { diseases: ['Cancer (multiple types)', 'Inflammatory disease'], drugTarget: true, drugStatus: 'Preclinical', approvedDrugs: [], category: 'Chaperone' },
    'TDP1': { diseases: ['Cancer (chemotherapy resistance)', 'Spinocerebellar ataxia with axonal neuropathy'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'DNA Repair' },
    'NFE2L2': { diseases: ['Cancer (chemoresistance)', 'Neurodegenerative disease', 'Chronic inflammation', 'Diabetes'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Transcription Factor' },
    'VEGFA': { diseases: ['Cancer (angiogenesis)', 'Age-related macular degeneration', 'Diabetic retinopathy'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Bevacizumab', 'Ranibizumab', 'Aflibercept'], category: 'Receptor/Channel' },
    'ALDH1A1': { diseases: ['Alcohol sensitivity', 'Cancer (stem cell marker)', 'Parkinson disease'], drugTarget: false, drugStatus: 'Research', approvedDrugs: [], category: 'Oxidoreductase' },
    'TOP2A': { diseases: ['Breast cancer', 'Ovarian cancer', 'Testicular cancer'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Etoposide', 'Doxorubicin'], category: 'DNA Topology' },
    'PLK1': { diseases: ['Breast cancer', 'Colorectal cancer', 'Non-small cell lung cancer'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Kinase/Phosphatase' },
    'SRC': { diseases: ['Chronic myeloid leukemia', 'Colorectal cancer', 'Osteoporosis'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Dasatinib', 'Bosutinib'], category: 'Kinase/Phosphatase' },
    'AKT1': { diseases: ['Breast cancer', 'Ovarian cancer', 'Prostate cancer', 'Proteus syndrome'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: ['Capivasertib'], category: 'Kinase/Phosphatase' },
    'MAPK1': { diseases: ['Non-small cell lung cancer', 'Colorectal cancer', 'Melanoma'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Trametinib', 'Cobimetinib'], category: 'Kinase/Phosphatase' },
    'MAPK3': { diseases: ['Cancer (multiple types)', 'RASopathies'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Kinase/Phosphatase' },
    'EGFR': { diseases: ['Non-small cell lung cancer', 'Colorectal cancer', 'Head and neck cancer', 'Glioblastoma'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Gefitinib', 'Erlotinib', 'Osimertinib', 'Cetuximab'], category: 'Kinase/Phosphatase' },
    'CDK2': { diseases: ['Breast cancer', 'Ovarian cancer', 'Melanoma'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Kinase/Phosphatase' },
    'MMP9': { diseases: ['Cancer metastasis', 'Rheumatoid arthritis', 'Multiple sclerosis', 'Atherosclerosis'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Protease' },
    'PARP1': { diseases: ['BRCA-mutant breast cancer', 'BRCA-mutant ovarian cancer', 'Pancreatic cancer', 'Prostate cancer'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Olaparib', 'Niraparib', 'Rucaparib', 'Talazoparib'], category: 'DNA Repair' },
    'TNF': { diseases: ['Rheumatoid arthritis', 'Psoriatic arthritis', 'Crohn disease', 'Ulcerative colitis', 'Ankylosing spondylitis'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Infliximab', 'Adalimumab', 'Etanercept'], category: 'Signaling' },
    'IL6': { diseases: ['Rheumatoid arthritis', 'Castleman disease', 'Cytokine release syndrome', 'Giant cell arteritis'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Tocilizumab', 'Sarilumab'], category: 'Signaling' },
    'DRD2': { diseases: ['Schizophrenia', 'Bipolar disorder', 'Parkinson disease', 'Hyperprolactinemia'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Risperidone', 'Haloperidol', 'Olanzapine', 'Bromocriptine'], category: 'Receptor/Channel' },
    'SLC6A3': { diseases: ['ADHD', 'Cocaine dependence', 'Parkinson disease (imaging)'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Methylphenidate'], category: 'Receptor/Channel' },
    'SLC6A4': { diseases: ['Major depressive disorder', 'Obsessive-compulsive disorder', 'Social anxiety disorder', 'Panic disorder'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Fluoxetine', 'Sertraline', 'Escitalopram', 'Citalopram'], category: 'Receptor/Channel' },
    'CNR1': { diseases: ['Chronic pain', 'Appetite regulation', 'Addiction', 'Nausea/vomiting'], drugTarget: true, drugStatus: 'Withdrawn', approvedDrugs: ['Rimonabant (withdrawn)', 'Dronabinol'], category: 'Receptor/Channel' },
    'CNR2': { diseases: ['Inflammatory pain', 'Autoimmune disease', 'Neuropathic pain'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Receptor/Channel' },
    'OPRM1': { diseases: ['Acute pain', 'Chronic pain', 'Opioid use disorder'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Morphine', 'Fentanyl', 'Oxycodone', 'Methadone'], category: 'Receptor/Channel' },
    'HTR2A': { diseases: ['Treatment-resistant depression', 'Schizophrenia', 'Migraine'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Psilocybin (clinical)', 'Risperidone', 'Pimavanserin'], category: 'Receptor/Channel' },
    'CFTR': { diseases: ['Cystic fibrosis', 'Bronchiectasis', 'Chronic pancreatitis'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Ivacaftor', 'Lumacaftor', 'Elexacaftor/Tezacaftor'], category: 'Receptor/Channel' },
    'GSK3B': { diseases: ['Alzheimer disease', 'Bipolar disorder', 'Diabetes', 'Cancer'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Kinase/Phosphatase' },
    'VDR': { diseases: ['Osteoporosis', 'Psoriasis', 'Vitamin D-dependent rickets', 'Autoimmune disease'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Calcitriol', 'Vitamin D analogs'], category: 'Nuclear Receptor' },
    'NTRK1': { diseases: ['NTRK fusion-positive cancers', 'Congenital insensitivity to pain'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Larotrectinib', 'Entrectinib'], category: 'Kinase/Phosphatase' },
    'KIT': { diseases: ['Gastrointestinal stromal tumor', 'Systemic mastocytosis', 'Acute myeloid leukemia', 'Melanoma'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Imatinib', 'Sunitinib', 'Regorafenib'], category: 'Kinase/Phosphatase' },
    'MET': { diseases: ['MET-ex14 NSCLC', 'Hepatocellular carcinoma', 'Gastric cancer'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Tepotinib', 'Capmatinib'], category: 'Kinase/Phosphatase' },
    'FGFR1': { diseases: ['FGFR-altered breast cancer', 'Myeloproliferative neoplasms', 'Pfeiffer syndrome'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Erdafitinib', 'Pemigatinib'], category: 'Kinase/Phosphatase' },
    'CASP3': { diseases: ['Cancer (defective apoptosis)', 'Neurodegeneration (excessive apoptosis)', 'Myocardial ischemia'], drugTarget: true, drugStatus: 'Preclinical', approvedDrugs: [], category: 'Apoptosis' },
    'SIRT1': { diseases: ['Metabolic syndrome', 'Type 2 diabetes', 'Aging-related diseases'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Epigenetic' },
    'DNMT1': { diseases: ['Myelodysplastic syndrome', 'Acute myeloid leukemia', 'CpG island methylator phenotype'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Azacitidine', 'Decitabine'], category: 'Epigenetic' },
    'TOP1': { diseases: ['Ovarian cancer', 'Small cell lung cancer', 'Cervical cancer'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Topotecan', 'Irinotecan'], category: 'DNA Topology' },
    'PTGS2': { diseases: ['Rheumatoid arthritis', 'Osteoarthritis', 'Colorectal cancer prevention', 'Acute pain'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Celecoxib', 'Etoricoxib'], category: 'Signaling' },
    'TERT': { diseases: ['Cancer (immortalization)', 'Dyskeratosis congenita', 'Idiopathic pulmonary fibrosis'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: ['Imetelstat'], category: 'Telomerase' },
    'TP53': { diseases: ['Li-Fraumeni syndrome', 'Cancer (most frequent mutation)'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Transcription Factor' },
    'HDAC1': { diseases: ['T-cell lymphoma', 'Breast cancer', 'HIV latency'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Vorinostat', 'Romidepsin'], category: 'Epigenetic' },
    'HDAC6': { diseases: ['Cancer', 'Neurodegenerative disease', 'Inflammatory disease'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Epigenetic' },
    'BCL2': { diseases: ['Chronic lymphocytic leukemia', 'Follicular lymphoma', 'Multiple myeloma', 'Acute myeloid leukemia'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Venetoclax'], category: 'Apoptosis' },
    'MTOR': { diseases: ['Renal cell carcinoma', 'Breast cancer', 'Tuberous sclerosis', 'LAM'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Everolimus', 'Temsirolimus'], category: 'Signaling' },
    'ESR2': { diseases: ['Breast cancer (prognosis)', 'Endometriosis', 'Prostate cancer'], drugTarget: false, drugStatus: 'Research', approvedDrugs: [], category: 'Receptor/Channel' },
    'PDPK1': { diseases: ['Cancer (PI3K pathway activation)', 'Diabetes'], drugTarget: true, drugStatus: 'Preclinical', approvedDrugs: [], category: 'Kinase/Phosphatase' },
    'PTPN1': { diseases: ['Type 2 diabetes', 'Obesity', 'Breast cancer'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Kinase/Phosphatase' },
  };

  var NAME_DISEASE = {
    'Tyrosyl-DNA phosphodiesterase': { diseases: ['Spinocerebellar ataxia with axonal neuropathy', 'Cancer (chemoresistance)'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'DNA Repair' },
    'Amyloid-beta precursor': { diseases: ['Alzheimer disease', 'Cerebral amyloid angiopathy', 'Down syndrome'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Aducanumab', 'Lecanemab', 'Donanemab'], category: 'Neurodegeneration' },
    'Microtubule-associated protein tau': { diseases: ['Alzheimer disease', 'Frontotemporal dementia', 'Progressive supranuclear palsy', 'Corticobasal degeneration'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Neurodegeneration' },
    'Nuclear factor erythroid 2-related factor 2': { diseases: ['Cancer (chemoresistance)', 'Neurodegenerative disease', 'Diabetes'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Transcription Factor' },
    'Nuclear receptor ROR-gamma': { diseases: ['Psoriasis', 'Multiple sclerosis', 'Asthma', 'Breast cancer'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Receptor/Channel' },
    'Histone-lysine N-methyltransferase EHMT2': { diseases: ['Cancer (multiple types)', 'Intellectual disability'], drugTarget: true, drugStatus: 'Preclinical', approvedDrugs: [], category: 'Epigenetic' },
    'Estrogen receptor': { diseases: ['Breast cancer', 'Endometrial cancer', 'Osteoporosis'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Tamoxifen', 'Fulvestrant', 'Letrozole', 'Anastrozole'], category: 'Receptor/Channel' },
    'Androgen receptor': { diseases: ['Prostate cancer', 'Androgen insensitivity syndrome', 'Spinal bulbar muscular atrophy'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Enzalutamide', 'Apalutamide', 'Darolutamide'], category: 'Receptor/Channel' },
    'Vitamin D3 receptor': { diseases: ['Osteoporosis', 'Psoriasis', 'Vitamin D-dependent rickets'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Calcitriol', 'Vitamin D analogs'], category: 'Receptor/Channel' },
    'Cyclooxygenase': { diseases: ['Rheumatoid arthritis', 'Osteoarthritis', 'Acute pain', 'Cancer prevention'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Celecoxib', 'Ibuprofen', 'Aspirin'], category: 'Signaling' },
    'Histone deacetylase': { diseases: ['T-cell lymphoma', 'Cancer (multiple types)', 'HIV latency'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Vorinostat', 'Romidepsin', 'Panobinostat'], category: 'Epigenetic' },
    'DNA topoisomerase': { diseases: ['Cancer (multiple types, chemotherapy target)'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Etoposide', 'Doxorubicin', 'Topotecan'], category: 'DNA Topology' },
    'Telomerase reverse transcriptase': { diseases: ['Cancer (immortalization)', 'Dyskeratosis congenita', 'Idiopathic pulmonary fibrosis'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: ['Imetelstat'], category: 'Telomerase' },
    'P-glycoprotein': { diseases: ['Cancer (multidrug resistance)', 'Epilepsy (drug resistance)'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'ABC Transporter' },
    'Multidrug resistance-associated protein': { diseases: ['Cancer (multidrug resistance)', 'Inflammatory disease'], drugTarget: true, drugStatus: 'Preclinical', approvedDrugs: [], category: 'ABC Transporter' },
    'Breast cancer resistance protein': { diseases: ['Cancer (drug resistance)', 'Gout (hyperuricemia)'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'ABC Transporter' },
    'Monoamine oxidase': { diseases: ['Parkinson disease', 'Depression'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Selegiline', 'Rasagiline', 'Phenelzine'], category: 'Oxidoreductase' },
    'Cytochrome P450': { diseases: ['Drug metabolism (pharmacogenomics)', 'Cushing syndrome', 'Cancer (hormone-dependent)'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Cytochrome P450' },
    'DNA methyltransferase': { diseases: ['Myelodysplastic syndrome', 'Acute myeloid leukemia'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Azacitidine', 'Decitabine'], category: 'Epigenetic' },
    'Matrix metalloproteinase': { diseases: ['Cancer metastasis', 'Rheumatoid arthritis', 'Atherosclerosis', 'Multiple sclerosis'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Protease' },
    'Cannabinoid receptor': { diseases: ['Chronic pain', 'Nausea/vomiting', 'Appetite regulation'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Dronabinol', 'Nabilone'], category: 'Receptor/Channel' },
    'GABA(A) receptor': { diseases: ['Epilepsy', 'Anxiety disorders', 'Insomnia'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Diazepam', 'Lorazepam', 'Alprazolam', 'Zolpidem'], category: 'Receptor/Channel' },
    'NMDA receptor': { diseases: ['Alzheimer disease', 'Major depressive disorder', 'Stroke (excitotoxicity)'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Memantine', 'Esketamine'], category: 'Receptor/Channel' },
    'Dopamine receptor': { diseases: ['Schizophrenia', 'Parkinson disease', 'Hyperprolactinemia', 'Bipolar disorder'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Haloperidol', 'Risperidone', 'Bromocriptine', 'Levodopa'], category: 'Receptor/Channel' },
    'Serotonin': { diseases: ['Migraine', 'Major depressive disorder', 'Schizophrenia'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Sumatriptan', 'Risperidone', 'Psilocybin (clinical)'], category: 'Receptor/Channel' },
    'Opioid receptor': { diseases: ['Acute pain', 'Chronic pain', 'Opioid use disorder'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Morphine', 'Fentanyl', 'Oxycodone', 'Naloxone'], category: 'Receptor/Channel' },
    'Vascular endothelial growth factor': { diseases: ['Cancer (angiogenesis)', 'Age-related macular degeneration', 'Diabetic retinopathy'], drugTarget: true, drugStatus: 'Approved', approvedDrugs: ['Bevacizumab', 'Ranibizumab', 'Aflibercept'], category: 'Receptor/Channel' },
    'Insulin-like growth factor': { diseases: ['Cancer (growth signaling)', 'Acromegaly', 'Growth disorders'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Receptor/Channel' },
    'Glycogen synthase kinase-3': { diseases: ['Alzheimer disease', 'Bipolar disorder', 'Cancer', 'Diabetes'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Kinase/Phosphatase' },
    'Lysine-specific demethylase': { diseases: ['Cancer (epigenetic)', 'Neurodevelopmental disorders'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Epigenetic' },
    'Hypoxia-inducible factor 1-alpha': { diseases: ['Cancer (hypoxia response)', 'Renal cell carcinoma', 'Ischemic disease'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: ['Belzutifan'], category: 'Transcription Factor' },
    'Methionine aminopeptidase 2': { diseases: ['Cancer (angiogenesis)', 'Colorectal cancer'], drugTarget: true, drugStatus: 'Clinical', approvedDrugs: [], category: 'Protease' },
    'Sortase A': { diseases: ['Bacterial infection (S. aureus virulence)'], drugTarget: true, drugStatus: 'Preclinical', approvedDrugs: [], category: 'Protease' },
  };

  function escapeHtml(t) { if (!t) return ''; var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function esc(t) { return escapeHtml(t); }
  function slugify(t) { if(!t)return'';var s=t.toLowerCase();s=s.replace(/'/g,'-').replace(/,/g,'-').replace(/ /g,'-').replace(/\//g,'-');s=s.replace(/[()]/g,'');s=s.replace(/[^a-z0-9一-鿿\-]/g,'');s=s.replace(/-+/g,'-').replace(/^-|-$/g,'');return(s.substring(0,80)||'untitled')+'.html'; }

  function imgUrl(cid, smiles, size) {
    size = size || 's';
    if (cid) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=' + cid + '&t=' + size;
    if (smiles) return 'https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?smiles=' + encodeURIComponent(smiles) + '&t=' + size;
    return '';
  }

  function getCatColor(cat) { return CATEGORY_COLORS[cat] || '#78909c'; }

  function getCtColor(ct) { return CHEMOTYPE_COLORS[ct] || '#78909c'; }

  function getCategoryCounts(data) {
    var counts = {};
    data.forEach(function (t) {
      var cat = t.category || 'Other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort(function (a, b) { return b[1] - a[1]; });
  }

  function parseIC50nM(activityStr) {
    if (!activityStr) return null;
    var m;
    m = activityStr.match(/Ki\s*=\s*([\d.]+)\s*nM/i);
    if (m) return parseFloat(m[1]);
    m = activityStr.match(/IC50\s*=\s*([\d.]+)\s*nM/i);
    if (m) return parseFloat(m[1]);
    m = activityStr.match(/Potency\s*=\s*([\d.]+)\s*nM/i);
    if (m) return parseFloat(m[1]);
    m = activityStr.match(/EC50\s*=\s*([\d.]+)\s*nM/i);
    if (m) return parseFloat(m[1]);
    m = activityStr.match(/Kd\s*=\s*([\d.]+)\s*nM/i);
    if (m) return parseFloat(m[1]);
    m = activityStr.match(/([\d.]+)\s*[\\u00b5]?M/i);
    if (m) return parseFloat(m[1]) * 1000;
    m = activityStr.match(/([\d.]+)\s*nM/i);
    if (m) return parseFloat(m[1]);
    return null;
  }

  function getFunction(name, gene, cat) {
    var text = '';
    for (var key in NAME_FUNCTIONS) {
      if (name.toUpperCase().indexOf(key.toUpperCase()) !== -1) { text = NAME_FUNCTIONS[key]; break; }
    }
    if (!text && gene) {
      var g = gene.toUpperCase();
      if (PROTEIN_FUNCTIONS[g]) text = PROTEIN_FUNCTIONS[g];
    }
    if (!text) {
      for (var key in PROTEIN_FUNCTIONS) {
        if (name.toUpperCase().indexOf(key) !== -1) { text = PROTEIN_FUNCTIONS[key]; break; }
      }
    }
    // Append therapeutic relevance from category
    if (text && cat && CATEGORY_THERAPY[cat]) {
      text += '\n\n' + CATEGORY_THERAPY[cat];
    }
    return text;
  }

  function getKEGG(name, gene) {
    for (var key in NAME_KEGG) {
      if (name.toUpperCase().indexOf(key.toUpperCase()) !== -1) return NAME_KEGG[key];
    }
    if (gene && KEGG_PATHWAYS[gene.toUpperCase()]) return KEGG_PATHWAYS[gene.toUpperCase()];
    for (var key in KEGG_PATHWAYS) {
      if (name.toUpperCase().indexOf(key) !== -1) return KEGG_PATHWAYS[key];
    }
    return null;
  }

  function getDiseaseInfo(name, gene, uniprot) {
    var data = null;
    // First try gene lookup
    if (gene) {
      var g = gene.toUpperCase();
      if (DISEASE_DATA[g]) data = DISEASE_DATA[g];
    }
    // Fallback to name lookup
    if (!data) {
      for (var key in NAME_DISEASE) {
        if (name.toUpperCase().indexOf(key.toUpperCase()) !== -1) { data = NAME_DISEASE[key]; break; }
      }
    }
    // Fallback to UniProt lookup
    if (!data && uniprot && DISEASE_BY_UNIPROT[uniprot]) {
      data = DISEASE_BY_UNIPROT[uniprot];
    }
    return data;
  }

  var DISEASE_BY_UNIPROT = {
    'O00444': {diseases: ['Microcephaly and chorioretinopathy, autosomal recessive, 2'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O15118': {diseases: ['Niemann-Pick disease C1'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O43318': {diseases: ['Frontometaphyseal dysplasia 2', 'Cardiospondylocarpofacial syndrome'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O43612': {diseases: ['Narcolepsy 1'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O75417': {diseases: ['Breast cancer'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O75874': {diseases: ['Glioma'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O94804': {diseases: ['Testicular germ cell tumor'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O94925': {diseases: ['Developmental and epileptic encephalopathy 71', 'CASGID syndrome', 'Global developmental delay, progressive ataxia, and elevated glutamine'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O95342': {diseases: ['Cholestasis, progressive familial intrahepatic, 2', 'Cholestasis, benign recurrent intrahepatic, 2'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O95479': {diseases: ['Cortisone reductase deficiency 1'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'O96017': {diseases: ['Tumor predisposition syndrome 4', 'Prostate cancer', 'Osteogenic sarcoma', 'Breast cancer'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P00734': {diseases: ['Factor II deficiency', 'Ischemic stroke', 'Thrombophilia due to thrombin defect', 'Pregnancy loss, recurrent, 2'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P01138': {diseases: ['Neuropathy, hereditary sensory and autonomic, 5'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P03886': {diseases: ['Leber hereditary optic neuropathy', 'Mitochondrial encephalomyopathy with lactic acidosis and stroke-like episodes syndrome', 'Alzheimer disease mitochondrial', 'Type 2 diabetes mellitus'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P04035': {diseases: ['Muscular dystrophy, limb-girdle, autosomal recessive 28'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P04062': {diseases: ['Gaucher disease', 'Gaucher disease 1', 'Gaucher disease 2', 'Gaucher disease 3', 'Gaucher disease 3C', 'Gaucher disease perinatal lethal', 'Parkinson disease'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P04075': {diseases: ['Glycogen storage disease 12'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P04150': {diseases: ['Glucocorticoid resistance, generalized'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P04156': {diseases: ['Creutzfeldt-Jakob disease', 'Fatal familial insomnia', 'Gerstmann-Straussler disease', 'Huntington disease-like 1', 'Kuru', 'Spongiform encephalopathy with neuropsychiatric features'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P04626': {diseases: ['Glioma', 'Ovarian cancer', 'Lung cancer', 'Gastric cancer', 'Visceral neuropathy, familial, 2, autosomal recessive'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P06213': {diseases: ['Rabson-Mendenhall syndrome', 'Leprechaunism', 'Type 2 diabetes mellitus', 'Hyperinsulinemic hypoglycemia, familial, 5', 'Insulin-resistant diabetes mellitus with acanthosis nigricans type A'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P07477': {diseases: ['Pancreatitis, hereditary'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P08253': {diseases: ['Multicentric osteolysis, nodulosis, and arthropathy'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P09619': {diseases: ['Myeloproliferative disorder chronic with eosinophilia', 'Leukemia, acute myelogenous', 'Leukemia, juvenile myelomonocytic', 'Basal ganglia calcification, idiopathic, 4', 'Myofibromatosis, infantile 1', 'Kosaki overgrowth syndrome', 'Premature aging syndrome, Penttinen type', 'Ocular pterygium-digital keloid dysplasia syndrome'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P10253': {diseases: ['Pompe disease, infantile-onset', 'Pompe disease, late-onset'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P10828': {diseases: ['Thyroid hormone resistance, generalized, autosomal dominant', 'Thyroid hormone resistance, generalized, autosomal recessive', 'Selective pituitary thyroid hormone resistance'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P11413': {diseases: ['Anemia, congenital, non-spherocytic hemolytic, 1'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P15056': {diseases: ['Colorectal cancer', 'Lung cancer', 'Familial non-Hodgkin lymphoma', 'Cardiofaciocutaneous syndrome 1', 'Noonan syndrome 7', 'LEOPARD syndrome 3'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P16473': {diseases: ['Hypothyroidism, congenital, non-goitrous, 1', 'Familial gestational hyperthyroidism', 'Hyperthyroidism, non-autoimmune'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P17612': {diseases: ['Primary pigmented nodular adrenocortical disease 4', 'Cardioacrofacial dysplasia 1'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P23415': {diseases: ['Hyperekplexia 1'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P23416': {diseases: ['Intellectual developmental disorder, X-linked, syndromic, Pilorge type'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P23458': {diseases: ['Autoinflammation, immune dysregulation, and eosinophilia'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P28331': {diseases: ['Mitochondrial complex I deficiency, nuclear type 5'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P36888': {diseases: ['Leukemia, acute myelogenous'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P42336': {diseases: ['Colorectal cancer', 'Breast cancer', 'Ovarian cancer', 'Hepatocellular carcinoma', 'Keratosis, seborrheic', 'Megalencephaly-capillary malformation-polymicrogyria syndrome', 'Congenital lipomatous overgrowth, vascular malformations, and epidermal nevi', 'Cowden syndrome 5', 'CLAPO syndrome', 'Macrodactyly', 'Cerebral cavernous malformations 4', 'Hemifacial myohyperplasia'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P46063': {diseases: ['RECON progeroid syndrome'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P47989': {diseases: ['Xanthinuria 1'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P51449': {diseases: ['Immunodeficiency 42'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P51955': {diseases: ['Retinitis pigmentosa 67'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P52333': {diseases: ['Severe combined immunodeficiency autosomal recessive T-cell-negative/B-cell-positive/NK-cell-negative'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P54760': {diseases: ['Lymphatic malformation 7', 'Capillary malformation-arteriovenous malformation 2'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P63092': {diseases: ['Albright hereditary osteodystrophy', 'Pseudohypoparathyroidism 1A', 'McCune-Albright syndrome', 'Progressive osseous heteroplasia', 'ACTH-independent macronodular adrenal hyperplasia 1', 'Pseudohypoparathyroidism 1B', 'Pseudohypoparathyroidism 1C'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P68400': {diseases: ['Okur-Chung neurodevelopmental syndrome'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'P78424': {diseases: ['Hereditary susceptibility to Wilms tumor 5'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q01196': {diseases: ['Familial platelet disorder with associated myeloid malignancy'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q01959': {diseases: ['Parkinsonism-dystonia 1, infantile-onset'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q02763': {diseases: ['Dominantly inherited venous malformations', 'Glaucoma 3, primary congenital, E'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q03164': {diseases: ['Wiedemann-Steiner syndrome'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q04206': {diseases: ['Autoinflammatory disease, familial, Behcet-like 3'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q06710': {diseases: ['Hypothyroidism, congenital, non-goitrous, 2'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q09013': {diseases: ['Dystrophia myotonica 1'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q13237': {diseases: ['Spondylometaphyseal dysplasia, Pagnamenta type', 'Acromesomelic dysplasia 4'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q13554': {diseases: ['Intellectual developmental disorder, autosomal dominant 54'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q13555': {diseases: ['Intellectual developmental disorder, autosomal dominant 59'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q14697': {diseases: ['Polycystic kidney disease 3 with or without polycystic liver disease'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q15120': {diseases: ['Charcot-Marie-Tooth disease, X-linked dominant, 6'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q15413': {diseases: ['Congenital myopathy 20'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q15466': {diseases: ['Obesity'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q16644': {diseases: ['Macular dystrophy, patterned, 3'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q99986': {diseases: ['Pontocerebellar hypoplasia 1A', 'Neuronopathy, distal hereditary motor, autosomal recessive 10'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9BTW9': {diseases: ['Encephalopathy, progressive, early-onset, with brain atrophy and thin corpus callosum'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9C0B1': {diseases: ['Growth retardation, developmental delay, and facial dysmorphism', 'Obesity'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9H1K0': {diseases: ['Kariminejad neurodevelopmental syndrome', 'Myelofibrosis, congenital, with anemia, neutropenia, developmental delay, and ocular abnormalities'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9NPD5': {diseases: ['Hyperbilirubinemia, Rotor type'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9NVI7': {diseases: ['Harel-Yoon syndrome', 'Pontocerebellar hypoplasia, hypotonia, and respiratory insufficiency syndrome, neonatal lethal'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9UBN7': {diseases: ['Chondrodysplasia with platyspondyly, distinctive brachydactyly, hydrocephaly, and microphthalmia'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9UKE5': {diseases: ['Intellectual developmental disorder, autosomal recessive 54'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9UM73': {diseases: ['Neuroblastoma 3'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9Y253': {diseases: ['Xeroderma pigmentosum variant type'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9Y2R2': {diseases: ['Systemic lupus erythematosus', 'Type 1 diabetes mellitus', 'Rheumatoid arthritis', 'Vitiligo'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
    'Q9Y6L6': {diseases: ['Hyperbilirubinemia, Rotor type'], drugTarget: false, drugStatus: '', approvedDrugs: [], category: 'Other'},
  };

  var NAME_TO_GENE = {
    '3-hydroxyacyl-CoA dehydrogenase type-2': 'HSD17B10',
    '3-phosphoinositide-dependent protein kinase 1': 'PDPK1',
    '5\'-AMP-activated protein kinase catalytic subunit alpha-2': 'PRKAA2',
    '72 kDa type IV collagenase': 'MMP2',
    'Acetylcholinesterase': 'ACHE',
    'Acidic phospholipase A2 2': 'PLA2G2D',
    'Aldehyde dehydrogenase 1A1': 'ALDH1A1',
    'ALK tyrosine kinase receptor': 'ALK',
    'Alpha-1A adrenergic receptor': 'ADRA1A',
    'Amyloid-beta precursor protein': 'APP',
    'Androgen receptor': 'AR',
    'Angiopoietin-1 receptor': 'TEK',
    'ATP-citrate synthase': 'ACLY',
    'ATP-dependent 6-phosphofructokinase': 'PFKL',
    'ATP-dependent DNA helicase Q1': 'RECQL',
    'Aurora kinase A': 'AURKA',
    'Aurora kinase B': 'AURKB',
    'B2 bradykinin receptor': 'BDKRB2',
    'Bile acid receptor': 'NR1H4',
    'Bile salt export pump': 'ABCB11',
    'Bromodomain adjacent to zinc finger domain protein 2B': 'BAZ2B',
    'Calcium/calmodulin-dependent protein kinase kinase 2': 'CAMKK2',
    'Calcium/calmodulin-dependent protein kinase type 1D': 'CAMK1D',
    'Calcium/calmodulin-dependent protein kinase type 1G': 'CAMK1G',
    'Calcium/calmodulin-dependent protein kinase type II subunit alpha': 'CAMK2A',
    'Calcium/calmodulin-dependent protein kinase type II subunit beta': 'CAMK2B',
    'Calcium/calmodulin-dependent protein kinase type II subunit delta': 'CAMK2D',
    'Calcium/calmodulin-dependent protein kinase type II subunit gamma': 'CAMK2G',
    'Calcium/calmodulin-dependent protein kinase type IV': 'CAMK4',
    'Calmodulin-1 (CALM1) ·UniProt P0DP23': 'CALM1',
    'cAMP-dependent protein kinase catalytic subunit alpha': 'PRKACA',
    'Cannabinoid receptor 1': 'CNR1',
    'Cannabinoid receptor 2': 'CNR2',
    'Casein kinase I isoform gamma-1': 'CSNK1G1',
    'Casein kinase I isoform gamma-2': 'CSNK1G2',
    'Casein kinase I isoform gamma-3': 'CSNK1G3',
    'Casein kinase II subunit alpha': 'CSNK2A1',
    'cGMP-dependent protein kinase': 'PRKG1',
    'Cholinesterase': 'BCHE',
    'Chromobox protein homolog 1': 'CBX1',
    'Creatine kinase M-type': 'CKM',
    'Cyclin-G-associated kinase': 'GAK',
    'Cyclin-dependent kinase 16': 'CDK16',
    'Cyclin-dependent kinase 4/cyclin D1': 'CDK4',
    'Cyclin-dependent kinase 6': 'CDK6',
    'Cyclin-dependent kinase-like 1': 'CDKL1',
    'Cytochrome P450 1A2': 'CYP1A2',
    'Cytochrome P450 2B6': 'CYP2B6',
    'Cytochrome P450 2C19': 'CYP2C19',
    'Cytochrome P450 2C8': 'CYP2C8',
    'Cytochrome P450 2C9': 'CYP2C9',
    'Cytochrome P450 3A5': 'CYP3A5',
    'Death-associated protein kinase 3': 'DAPK3',
    'Delta-type opioid receptor': 'OPRD1',
    'Deoxynucleoside triphosphate triphosphohydrolase SAMHD1': 'SAMHD1',
    'DNA dC->dU-editing enzyme APOBEC-3F': 'APOBEC3F',
    'DNA polymerase beta': 'POLB',
    'DNA polymerase eta': 'POLH',
    'DNA polymerase iota': 'POLI',
    'DNA polymerase kappa': 'POLK',
    'DNA repair nuclease/redox regulator APEX1': 'APEX1',
    'DNA topoisomerase 1': 'TOP1',
    'DNA topoisomerase 2': 'TOP2A',
    'DNA Topoisomerase IIalphaP11388': 'TOP2A',
    'Dual specificity mitogen-activated protein kinase kinase 1': 'MAP2K1',
    'Dual specificity protein kinase CLK1': 'CLK1',
    'Dual specificity protein kinase CLK2': 'CLK2',
    'Dual specificity protein kinase CLK3': 'CLK3',
    'Ephrin type-B receptor 4': 'EPHB4',
    'Epidermal growth factor receptor': 'EGFR',
    'Estrogen receptor': 'ESR1',
    'Estrogen receptor beta': 'ESR2',
    'Flap endonuclease 1': 'FEN1',
    'Focal adhesion kinase 1': 'PTK2',
    'Fructose-bisphosphate aldolase': 'ALDOA',
    'Geranylgeranyl transferase type I': 'GGT1',
    'Glucagon-like peptide 1 receptor': 'GLP1R',
    'Glucocorticoid receptor': 'NR3C1',
    'Glucose-6-phosphate 1-dehydrogenase': 'G6PD',
    'Glucose-6-phosphate dehydrogenase-6-phosphogluconolactonase': 'G6PD',
    'Glutaminase kidney isoform, mitochondrial': 'GLS',
    'Glycine receptor subunit alpha-1': 'GLRA1',
    'Glycine receptor subunit alpha-2': 'GLRA2',
    'Glycogen synthase kinase-3 beta': 'GSK3B',
    'Group IID secretory phospholipase A2': 'PLA2G2D',
    'Heat shock protein HSP 90-alpha': 'HSP90AA1',
    'Heat shock protein HSP 90-beta': 'HSP90AB1',
    'Heat shock protein HSP90': 'HSP90',
    'Hepatocyte growth factor receptor': 'MET',
    'High affinity nerve growth factor receptor': 'NTRK1',
    'Histone acetyltransferase KAT2A': 'KAT2A',
    'Human immunodeficiency virus type 1 reverse transcriptase': 'HIV-RT',
    'Hypoxia-inducible factor 1-alpha': 'HIF1A',
    'Indoleamine 2,3-dioxygenase 1': 'IDO1',
    'Induced myeloid leukemia cell differentiation protein Mcl-1': 'MCL1',
    'Inhibition of factor 2a': 'IF2A',
    'Insulin receptor': 'INSR',
    'Insulin-like growth factor 1 receptor': 'IGF1R',
    'Isocitrate dehydrogenase [NADP] cytoplasmic': 'IDH1',
    'Janus Kinase (JAK)': 'JAK',
    'Kappa-type opioid receptor': 'OPRK1',
    'Luciferin 4-monooxygenase': 'Luc',
    'Lymphokine-activated killer T-cell-originated protein kinase': 'PBK',
    'Lysosomal acid glucosylceramidase': 'GBA',
    'Lysosomal alpha-glucosidase': 'GAA',
    'MAP kinase p38': 'MAPK14',
    'Macrophomina phaseolina': 'Mph',
    'Major prion protein': 'PRNP',
    'Microtubule-associated protein tau': 'MAPT',
    'Mitochondrial complex I; NADH oxidoreductase': 'NDUF',
    'Mitogen-activated protein kinase 1': 'MAPK1',
    'Mitogen-activated protein kinase 3': 'MAPK3',
    'Mitogen-activated protein kinase 6': 'MAPK6',
    'Mitogen-activated protein kinase kinase kinase 5': 'MAP3K5',
    'Mitogen-activated protein kinase kinase kinase 8': 'MAP3K8',
    'Mu-type opioid receptor': 'OPRM1',
    'Multidrug and toxin extrusion protein 1': 'SLC47A1',
    'Multidrug and toxin extrusion protein 2': 'SLC47A2',
    'Mycothiol S-conjugate amidase': 'MCA',
    'Myotonin-protein kinase': 'DMPK',
    'Nakaseomyces glabratus': 'Ngl',
    'Neuropeptide S receptor': 'NPSR1',
    'NUAK family SNF1-like kinase 1': 'NUAK1',
    'Orexin receptor type 2': 'HCRTR2',
    'Orexin/Hypocretin receptor type 1': 'HCRTR1',
    'Organic anion transporter 3': 'SLC22A8',
    'Oxysterol-binding protein 1': 'OSBP',
    'Oxysterol-binding protein 2': 'OSBP2',
    'Oxysterols receptor LXR-alpha': 'NR1H3',
    'Paired box protein Pax-8': 'PAX8',
    'Peptidyl-prolyl cis-trans isomerase NIMA-interacting 1': 'PIN1',
    'Peroxisome proliferator-activated receptor delta': 'PPARD',
    'Peroxisome proliferator-activated receptor gamma': 'PPARG',
    'Phospholipase A2, membrane associated': 'PLA2G2A',
    'PI3Kalpha': 'PIK3CA',
    'Platelet-derived growth factor receptor beta': 'PDGFRB',
    'POU domain, class 2, transcription factor 1': 'POU2F1',
    'POU domain, class 2, transcription factor 2': 'POU2F2',
    'Prostaglandin G/H synthase 2': 'PTGS2',
    'Protein deacetylase HDAC6': 'HDAC6',
    'Protein kinase C (PKC)': 'PRKCA',
    'Proton-coupled amino acid transporter 1': 'SLC36A1',
    'Pyruvate kinase': 'PKLR',
    'Pyruvate kinase PKM': 'PKM',
    'RAC-alpha serine/threonine-protein kinase': 'AKT1',
    'Receptor tyrosine-protein kinase erbB-2': 'ERBB2',
    'Receptor-type tyrosine-protein kinase FLT3': 'FLT3',
    'Retinoic acid receptor RXR-alpha': 'RXRA',
    'Rhizoctonia solani': 'Rs',
    'Ribosomal protein S6 kinase alpha-3': 'RPS6KA3',
    'RNA-binding protein pos-1': 'pos-1',
    'Runt-related transcription factor 1/Core-binding factor subunit beta': 'RUNX1',
    'Ryanodine receptor 2': 'RYR2',
    'Serine/threonine-protein kinase 10': 'STK10',
    'Serine/threonine-protein kinase 16': 'STK16',
    'Serine/threonine-protein kinase 17A': 'STK17A',
    'Serine/threonine-protein kinase 25': 'STK25',
    'Serine/threonine-protein kinase 26': 'STK26',
    'Serine/threonine-protein kinase 3': 'STK3',
    'Serine/threonine-protein kinase 38': 'STK38',
    'Serine/threonine-protein kinase B-raf': 'BRAF',
    'Serine/threonine-protein kinase Chk2': 'CHEK2',
    'Serine/threonine-protein kinase N1': 'PKN1',
    'Serine/threonine-protein kinase Nek2': 'NEK2',
    'Serine/threonine-protein kinase Nek6': 'NEK6',
    'Serine/threonine-protein kinase OSR1': 'OXSR1',
    'Serine/threonine-protein kinase PAK 4': 'PAK4',
    'Serine/threonine-protein kinase PAK 5': 'PAK5',
    'Serine/threonine-protein kinase PLK1': 'PLK1',
    'Serine/threonine-protein kinase PLK4': 'PLK4',
    'Serine/threonine-protein kinase RIO2': 'RIOK2',
    'Serine/threonine-protein kinase VRK1': 'VRK1',
    'Serine/threonine-protein kinase VRK2': 'VRK2',
    'Serine/threonine-protein kinase VRK3': 'VRK3',
    'Serine/threonine-protein kinase pim-1': 'PIM1',
    'Serine/threonine-protein kinase pim-2': 'PIM2',
    'Serine/threonine-protein kinase pim-3': 'PIM3',
    'Sodium-dependent dopamine transporter': 'SLC6A3',
    'Sortase A': 'SrtA',
    'Sphingomyelin phosphodiesterase 2': 'SMPD2',
    'STE20-like serine/threonine-protein kinase': 'SLK',
    'Survival motor neuron protein': 'SMN1',
    'T-complex protein 1 subunit beta': 'CCT2',
    'Telomerase reverse transcriptase': 'TERT',
    'Thioredoxin glutathione reductase': 'TGR',
    'Thioredoxin reductase 1, cytoplasmic': 'TXNRD1',
    'Thyroid hormone receptor beta': 'THRB',
    'Thyrotropin receptor': 'TSHR',
    'Transcription factor p65': 'RELA',
    'Tubulin': 'TUBB',
    'Tumor susceptibility gene 101 protein': 'TSG101',
    'Tyrosine-protein kinase Fes/Fps': 'FES',
    'Tyrosine-protein kinase JAK1': 'JAK1',
    'Tyrosine-protein kinase Lck': 'LCK',
    'Tyrosine-protein kinase receptor UFO': 'AXL',
    'Tyrosine-protein phosphatase non-receptor type 1': 'PTPN1',
    'Tyrosyl-DNA phosphodiesterase 1': 'TDP1',
    'Urease': 'Ure',
    'Vitamin D3 receptor': 'VDR',
    'Xanthine dehydrogenase/oxidase': 'XDH',
    'Zinc finger protein mex-5': 'mex-5',
    'alpha-Glucosidase': 'GAA',
    '[Pyruvate dehydrogenase (acetyl-transferring)] kinase isozyme 1, mitochondrial': 'PDK1',
    '[Pyruvate dehydrogenase (acetyl-transferring)] kinase isozyme 3, mitochondrial': 'PDK3',
  };

  function deriveGene(name) {
    // Check PROTEIN_FUNCTIONS keys (gene symbols) directly
    for (var key in PROTEIN_FUNCTIONS) {
      if (name.toUpperCase().indexOf(key) !== -1) return key;
    }
    // Check NAME_TO_GENE table by name pattern
    for (var key in NAME_TO_GENE) {
      if (name.toUpperCase().indexOf(key.toUpperCase()) !== -1) return NAME_TO_GENE[key];
    }
    // Check NAME_KEGG keys (also descriptive)
    for (var key in NAME_KEGG) {
      if (name.toUpperCase().indexOf(key.toUpperCase()) !== -1) return key.substring(0, 8).toUpperCase();
    }
    return '';
  }

  function refineCategory(name, cat) {
    if (cat !== 'Other') return cat;
    var u = name.toUpperCase();
    var pairs = [
      ['HSP90', 'Chaperone'], ['HEAT SHOCK PROTEIN', 'Chaperone'], ['HSC82', 'Chaperone'], ['HSP82', 'Chaperone'],
      ['DNA POLYMERASE', 'DNA Repair'], ['DNA REPAIR', 'DNA Repair'], ['TDP1', 'DNA Repair'], ['TYROSYL-DNA', 'DNA Repair'],
      ['APEX1', 'DNA Repair'], ['FLAP ENDONUCLEASE', 'DNA Repair'], ['RECQL', 'DNA Repair'], ['SAMHD1', 'DNA Repair'],
      ['TRANSCRIPTION FACTOR', 'Transcription Factor'], ['POU DOMAIN', 'Transcription Factor'], ['PAX8', 'Transcription Factor'],
      ['RUNX1', 'Transcription Factor'], ['P65', 'Transcription Factor'], ['RELA', 'Transcription Factor'],
      ['HIF1A', 'Transcription Factor'], ['NFE2L2', 'Transcription Factor'],
      ['SOLUTE CARRIER', 'SLC Transporter'], ['ORGANIC ANION TRANSPORTER', 'SLC Transporter'],
      ['MATE1', 'SLC Transporter'], ['MATE2', 'SLC Transporter'],
      ['SLC22A', 'SLC Transporter'], ['SLCO', 'SLC Transporter'],
      ['FRUCTOSE-BISPHOSPHATE ALDOLASE', 'Metabolic Enzyme'], ['ATP-CITRATE', 'Metabolic Enzyme'],
      ['GLUTAMINASE', 'Metabolic Enzyme'], ['FTO', 'Metabolic Enzyme'],
      ['GLUCOSE-6-PHOSPHATE', 'Metabolic Enzyme'], ['ISOCITRATE DEHYDROGENASE', 'Metabolic Enzyme'],
      ['PYRUVATE KINASE', 'Metabolic Enzyme'], ['ALPHA-KETOGLUTARATE', 'Metabolic Enzyme'],
      ['FARNESYL', 'Metabolic Enzyme'], ['GERANYLGERANYL', 'Metabolic Enzyme'],
      ['LYSINE-SPECIFIC DEMETHYLASE', 'Epigenetic'], ['CHROMOBOX', 'Epigenetic'],
      ['BROMODOMAIN', 'Epigenetic'],
      ['MACROPHOMINA', 'Pathogen Protein'], ['NAKASEOMYCES', 'Pathogen Protein'],
      ['RHIZOCTONIA', 'Pathogen Protein'], ['POS-1', 'Pathogen Protein'], ['MEX-5', 'Pathogen Protein'],
      ['HIV-RT', 'Pathogen Protein'], ['MptpB', 'Pathogen Protein'], ['REPLICASE POLYPROTEIN', 'Pathogen Protein'],
      ['SORTASE', 'Hydrolase'], ['UREASE', 'Hydrolase'], ['GLUCOSIDASE', 'Hydrolase'],
      ['GLUCOSYLCERAMIDASE', 'Hydrolase'], ['SPHINGOMYELIN', 'Hydrolase'],
      ['PHOSPHOLIPASE A2', 'Hydrolase'], ['MYCOTHIOL', 'Hydrolase'],
      ['BINDING PROTEIN', 'Other'], ['UNCHARACTERIZED', 'Other'], ['UNKNOWN', 'Other'],
      ['MMP', 'Protease'], ['COLLAGENASE', 'Protease'], ['TRYPSIN', 'Protease'],
      ['INHIBITION OF FACTOR', 'Protease'], ['THROMBIN', 'Protease'],
      ['MULTIDRUG', 'ABC Transporter'], ['BILE SALT', 'ABC Transporter'],
      ['CALMODULIN', 'Signaling'], ['GNAS', 'Signaling'], ['RAB-9A', 'Signaling'], ['PI3K', 'Signaling'],
      ['AMYLOID-BETA', 'Neurodegeneration'], ['PRION', 'Neurodegeneration'], ['TAR DNA', 'Neurodegeneration'],
      ['SMN1', 'RNA Processing'], ['CARBOXY-TERMINAL', 'RNA Processing'], ['SURVIVAL MOTOR', 'RNA Processing'],
      ['OSBP', 'Lipid Transport'], ['NPC', 'Lipid Transport'],
      ['PROSTAGLANDIN', 'Signaling'], ['COX-2', 'Signaling'],
      ['TELOMERASE', 'Telomerase'], ['TERT', 'Telomerase'],
      ['SARCOPLASMIC', 'Ion Pump'], ['CALCIUM ATPASE', 'Ion Pump'],
      ['INDOLEAMINE', 'Immune Regulation'], ['IDO1', 'Immune Regulation'],
      ["PHOSPHOPANTETHEINYL", "Metabolic Enzyme"],
    ];
    for (var i = 0; i < pairs.length; i++) {
      if (u.indexOf(pairs[i][0]) !== -1) return pairs[i][1];
    }
    return cat;
  }

  function getRefinedCat(t) {
    return refineCategory(t.name, t.category || 'Other');
  }

  function initCharts(data) {
    // Top targets by compound_count (bar chart)
    var sorted = data.slice().sort(function (a, b) { return (b.compound_count || 0) - (a.compound_count || 0); }).slice(0, 10);
    var maxCount = sorted.length > 0 ? sorted[0].compound_count : 1;
    var barColors = ['#0077b6','#0096c7','#00b4d8','#48cae4','#90e0ef','#023e8a','#005f8c','#0077b6','#0096c7','#00b4d8'];
    var barHtml = '';
    sorted.forEach(function (t, i) {
      var pct = (t.compound_count / maxCount) * 100;
      var label = t.name.length > 32 ? t.name.substring(0, 30) + '...' : t.name;
      barHtml += '<div class="bar-row"><span class="bar-label" title="' + esc(t.name) + '">' + esc(label) + '</span><div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + barColors[i % barColors.length] + '"></div></div><span class="bar-count">' + t.compound_count + '</span></div>';
    });
    document.getElementById('topTargetBars').innerHTML = barHtml;

    // Category distribution donut (simplified: ~13 groups)
    var SIMPLIFIED_COLORS = {
      'Kinase/Phosphatase': '#e53935', 'Receptor/Channel': '#d4532a', 'Oxidoreductase': '#3949ab',
      'Epigenetic': '#6d4c41', 'Cytochrome P450': '#fb8c00', 'Protease': '#00897b',
      'Chaperone': '#f06292', 'DNA Repair': '#26c6da', 'Transcription Factor': '#7e57c2',
      'Metabolic Enzyme': '#66bb6a', 'ABC Transporter': '#8e24aa', 'DNA Topology': '#00acc1',
      'Cytoskeletal': '#c0ca33', 'Other': '#78909c',
    };
    // Merge refined categories into simplified groups
    var SIMPLIFIED_MERGE = {
      'SLC Transporter': 'Other', 'Pathogen Protein': 'Other', 'Hydrolase': 'Other',
      'Signaling': 'Other', 'Neurodegeneration': 'Other', 'RNA Processing': 'Other',
      'Lipid Transport': 'Other', 'Telomerase': 'Other', 'Ion Pump': 'Other',
      'Immune Regulation': 'Other',
    };
    // Add existing original categories not in SIMPLIFIED_COLORS as 'Other'
    data.forEach(function (t) {
      var base = t.category || 'Other';
      if (!SIMPLIFIED_COLORS[base] && base !== 'Other') SIMPLIFIED_COLORS[base] = '#78909c';
    });
    var catCounts = {};
    data.forEach(function (t) {
      var rc = refineCategory(t.name, t.category || 'Other');
      var sc = SIMPLIFIED_MERGE[rc] || rc;
      if (!SIMPLIFIED_COLORS[sc]) sc = 'Other';
      catCounts[sc] = (catCounts[sc] || 0) + 1;
    });
    var catOrder = Object.keys(catCounts).sort(function (a, b) { return catCounts[b] - catCounts[a]; });
    var catTotal = catOrder.reduce(function (s, k) { return s + catCounts[k]; }, 0) || 1;
    var canvas = document.getElementById('catDonut');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var cx = 90, cy = 90, r = 72;
    var startAngle = -Math.PI / 2;
    catOrder.forEach(function (k) {
      var val = catCounts[k] || 0;
      if (val === 0) return;
      var slice = (val / catTotal) * Math.PI * 2;
      var color = SIMPLIFIED_COLORS[k] || '#78909c';
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath(); ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
      startAngle += slice;
    });
    ctx.fillStyle = '#0d1b2a'; ctx.font = 'bold 22px "Noto Sans SC",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(catTotal, cx, cy - 5);
    ctx.font = '10px "Noto Sans SC",sans-serif'; ctx.fillStyle = '#78909c';
    ctx.fillText('targets', cx, cy + 13);
    // Legend below the donut
    var legHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:12px;justify-content:center;">';
    catOrder.forEach(function (k) {
      var val = catCounts[k] || 0;
      var color = SIMPLIFIED_COLORS[k] || '#78909c';
      legHtml += '<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--text-secondary);"><span style="width:8px;height:8px;border-radius:50%;background:' + color + ';flex-shrink:0;"></span> ' + k + ' <strong style="color:var(--text-primary);font-family:var(--font-mono);font-size:10px;">' + val + '</strong></span>';
    });
    legHtml += '</div>';
    document.getElementById('catLegend').innerHTML = legHtml;
  }

  function initBrowse() {
    var list = document.getElementById('target-list');
    var filters = document.getElementById('target-category-filters');
    var searchInput = document.getElementById('target-search');
    var countEl = document.getElementById('target-count');
    if (!list) return;

    getTargetsData().then(function (data) {
        targets = data;
        filteredTargets = data;

        // Populate stats
        var uniprotCount = data.filter(function (t) { return t.uniprot; }).length;
        var totalCpds = data.reduce(function (s, t) { return s + (t.compound_count || 0); }, 0);
        var catSet = {};
        data.forEach(function (t) { catSet[t.category] = true; });
        var catCount = Object.keys(catSet).length;
        var statTotal = document.getElementById('stat-total');
        var statUniprot = document.getElementById('stat-uniprot');
        var statCat = document.getElementById('stat-categories');
        var statCpd = document.getElementById('stat-compounds');
        if (statTotal) statTotal.textContent = data.length;
        if (statUniprot) statUniprot.textContent = uniprotCount;
        if (statCat) statCat.textContent = catCount;
        if (statCpd) statCpd.textContent = totalCpds;

        initCharts(data);

        var refinedCats = {};
        data.forEach(function (t) { var rc = refineCategory(t.name, t.category || 'Other'); refinedCats[rc] = (refinedCats[rc] || 0) + 1; });
        var refinedOrder = Object.keys(refinedCats).sort(function (a, b) { return refinedCats[b] - refinedCats[a]; });
        var allChip = document.createElement('div');
        allChip.className = 'filter-chip active';
        allChip.dataset.category = '';
        allChip.textContent = 'All (' + data.length + ')';
        filters.appendChild(allChip);

        refinedOrder.forEach(function (cat) {
          var chip = document.createElement('div');
          chip.className = 'filter-chip';
          chip.dataset.category = cat;
          chip.textContent = cat + ' (' + refinedCats[cat] + ')';
          filters.appendChild(chip);
        });

        filters.addEventListener('click', function (e) {
          var chip = e.target.closest('.filter-chip');
          if (!chip) return;
          filters.querySelectorAll('.filter-chip').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          applyFilters();
        });

        searchInput && searchInput.addEventListener('input', applyFilters);
        filteredTargets = data;
        renderPage(0);
        if (countEl) countEl.textContent = data.length + ' targets';

        function applyFilters() {
          var activeCat = filters && filters.querySelector('.filter-chip.active');
          var cat = activeCat ? activeCat.dataset.category : '';
          var ft = cat ? targets.filter(function (t) { return refineCategory(t.name, t.category || 'Other') === cat; }) : targets.slice();
          if (searchInput && searchInput.value.trim()) {
            var q = searchInput.value.trim().toLowerCase();
            ft = ft.filter(function (t) { return t.name.toLowerCase().indexOf(q) !== -1; });
          }
          filteredTargets = ft;
          renderPage(0);
          if (countEl) countEl.textContent = ft.length + ' targets';
        }
      })
      .catch(function () {
        if (list) list.innerHTML = '<div class="empty-state">Failed to load target data</div>';
      });
  }

  function renderTargetList(list, data) {
    if (data.length === 0) {
      list.innerHTML = '<div class="empty-state">No targets match your filter</div>';
      return;
    }
    var html = '';
    data.forEach(function (t) {
      var refinedCat = refineCategory(t.name, t.category || 'Other');
      var catColor = getCatColor(t.category);
      var geneSym = deriveGene(t.name);
      var cpdCount = t.compound_count || 0;
      html += '<a href="../3-Targets/' + slugify(t.name) + '" class="target-card">';
      html += '  <div class="tcard-row">';
      html += '    <div class="tcard-left">';
      if (geneSym) html += '      <span class="tcard-gene">' + escapeHtml(geneSym) + '</span>';
      html += '      <span class="tcard-id">' + (t.uniprot || '—') + '</span>';
      html += '    </div>';
      html += '    <div class="tcard-right">';
      html += '      <span class="tcard-cpd-num">' + cpdCount + '</span>';
      html += '      <span class="tcard-cpd-label">cpds</span>';
      html += '    </div>';
      html += '  </div>';
      html += '  <h3 class="tcard-name">' + escapeHtml(t.name) + '</h3>';
      html += '  <div class="tcard-bottom">';
      html += '    <span class="tcard-cat" style="background:' + catColor + '15;color:' + catColor + '">' + escapeHtml(refinedCat) + '</span>';
      html += '  </div>';
      html += '</a>';
    });
    list.innerHTML = html;
  }

  function renderPage(page) {
    var list = document.getElementById('target-list');
    var pn = document.getElementById('pageNav');
    var rc = document.getElementById('resultCount');
    if (!list) return;
    var total = filteredTargets.length;
    var pages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(page, pages - 1);
    var start = currentPage * pageSize;
    var pageData = filteredTargets.slice(start, start + pageSize);
    if (rc) rc.textContent = total;
    renderTargetList(list, pageData);

    // Pagination buttons
    if (!pn) return;
    var ph = '';
    if (pages > 1) {
      ph += '<div class="page-btn" data-p="' + (currentPage - 1) + '" style="' + (currentPage === 0 ? 'opacity:0.3;cursor:default;' : '') + '">‹</div>';
      for (var i = 0; i < pages; i++) {
        if (i === 0 || i === pages - 1 || Math.abs(i - currentPage) <= 2)
          ph += '<div class="page-btn' + (i === currentPage ? ' active' : '') + '" data-p="' + i + '">' + (i + 1) + '</div>';
        else if ((i === 1 && currentPage > 3) || (i === pages - 2 && currentPage < pages - 4))
          ph += '<span style="color:var(--text-muted);font-size:12px;padding:0 2px;">…</span>';
      }
      ph += '<div class="page-btn" data-p="' + (currentPage + 1) + '" style="' + (currentPage >= pages - 1 ? 'opacity:0.3;cursor:default;' : '') + '">›</div>';
    }
    pn.innerHTML = ph;

    // Attach pagination events
    pn.onclick = function (e) {
      var btn = e.target.closest('.page-btn');
      if (!btn) return;
      var p = parseInt(btn.dataset.p);
      if (!isNaN(p) && p >= 0 && p < pages) renderPage(p);
    };
  }

  function initDetail() {
    var container = document.getElementById('target-detail');
    if (!container) return;

    var params = new URLSearchParams(window.location.search);
    var targetId = params.get('target');
    if (!targetId) {
      container.innerHTML = '<div class="empty-state">No target specified. <a href="browse-targets.html">Browse targets</a></div>';
      return;
    }

    getTargetsData().then(function (data) {
        var target = data.find(function (t) { return (t.uniprot || t.name) === targetId; });
        if (!target) {
          container.innerHTML = '<div class="empty-state">Target not found. <a href="browse-targets.html">Browse targets</a></div>';
          return;
        }
        renderTargetDetail(container, target);
      })
      .catch(function () {
        container.innerHTML = '<div class="empty-state">Failed to load target data</div>';
      });
  }

  var sortState = { field: 'potency', dir: 1 };

  function sortVal(cpd, field) {
    if (field === 'name') return (cpd.name || '').toUpperCase();
    if (field === 'formula') return (cpd.formula || '').toUpperCase();
    if (field === 'mw') return parseFloat(cpd.mw) || 0;
    if (field === 'activity') return parseIC50nM(cpd.ic50) || -1;
    if (field === 'chemotype') return (cpd.chemotype || '').toUpperCase();
    if (field === 'potency') return parseIC50nM(cpd.ic50) === null ? 999999 : parseIC50nM(cpd.ic50);
    return 0;
  }

  function sortCompounds(cpds) {
    return (cpds || []).slice().sort(function (a, b) {
      var va = sortVal(a, sortState.field);
      var vb = sortVal(b, sortState.field);
      if (typeof va === 'string') {
        return sortState.dir * va.localeCompare(vb);
      }
      return sortState.dir * (va - vb);
    });
  }

  function renderCompoundTableBody(cpds, container) {
    container.innerHTML = '';
    if (cpds.length === 0) {
      container.innerHTML = '<div class="empty-state">No compounds in this range</div>';
    } else {
      cpds.forEach(function (c) { container.innerHTML += renderCpdRow(c); });
    }
  }

  function renderTargetDetail(container, target) {
    var catColor = getCatColor(target.category);
    var gene = target.gene;
    var functionText = getFunction(target.name, gene);
    var pathways = getKEGG(target.name, gene);
    var sortedCpds = target.compounds;

    var html = '';

    html += '<a href="browse-targets.html" class="detail-back">\u2190 Targets \u00b7 返回靶标总览</a>';

    // Horizontal hero: title left / stats right
    html += '<div class="target-hero">';
    html += '  <div class="hero-body">';
    html += '    <div class="hero-left">';
    html += '      <div class="target-hero-tags">';
    html += '        <span class="target-hero-cat" style="background:' + catColor + '18;color:' + catColor + '">' + escapeHtml(target.category) + '</span>';
    if (gene) html += '        <span class="target-hero-gene">' + escapeHtml(gene) + '</span>';
    html += '      </div>';
    html += '      <h1 class="target-hero-title">' + escapeHtml(target.name) + '</h1>';
    html += '    </div>';
    html += '    <div class="hero-right">';
    html += '      <div class="hero-stats-grid">';
    if (target.uniprot) {
      html += '        <div class="hero-stat"><div class="hero-stat-label">UniProt</div><div class="hero-stat-value"><a href="https://www.uniprot.org/uniprotkb/' + target.uniprot + '/entry" target="_blank" rel="noopener">' + escapeHtml(target.uniprot) + ' \u2197</a></div></div>';
    } else {
      html += '        <div class="hero-stat"><div class="hero-stat-label">UniProt</div><div class="hero-stat-value" style="color:var(--text-muted);font-size:12px;">\u2014</div></div>';
    }
    html += '        <div class="hero-stat"><div class="hero-stat-label">Category</div><div class="hero-stat-value" style="color:' + catColor + ';font-size:13px;">' + escapeHtml(target.category) + '</div></div>';
    if (gene) {
      html += '        <div class="hero-stat"><div class="hero-stat-label">Gene</div><div class="hero-stat-value" style="font-family:var(--font-mono);font-size:15px;">' + escapeHtml(gene) + '</div></div>';
    } else {
      html += '        <div class="hero-stat"><div class="hero-stat-label">Gene</div><div class="hero-stat-value" style="color:var(--text-muted);font-size:12px;">\u2014</div></div>';
    }
    html += '        <div class="hero-stat"><div class="hero-stat-label">Compounds</div><div class="hero-stat-value">' + target.compound_count + '</div><div class="hero-stat-sub">active</div></div>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';

    // External Links
    html += '<div class="detail-section">';
    html += '  <h2 class="detail-section-title">External Links \u00b7 外部数据库</h2>';
    html += '  <div class="ext-links-row">';
    if (target.uniprot) {
      html += '    <a href="https://www.uniprot.org/uniprotkb/' + target.uniprot + '/entry" target="_blank" rel="noopener" class="ext-link-pill"><span class="ext-link-icon">\ud83d\udcda</span> UniProt \u2197</a>';
      html += '    <a href="https://go.drugbank.com/uniprot/' + target.uniprot + '" target="_blank" rel="noopener" class="ext-link-pill"><span class="ext-link-icon">💊</span> DrugBank ↗</a>';
    }
    if (gene) {
      html += '    <a href="https://www.kegg.jp/entry/' + gene.toLowerCase() + '" target="_blank" rel="noopener" class="ext-link-pill"><span class="ext-link-icon">🧬</span> KEGG ↗</a>';
      html += '    <a href="https://www.genecards.org/cgi-bin/carddisp.pl?gene=' + encodeURIComponent(gene) + '" target="_blank" rel="noopener" class="ext-link-pill"><span class="ext-link-icon">🧾</span> GeneCards ↗</a>';
      html += '    <a href="https://www.ebi.ac.uk/chembl/g/#browse/targets/filter/_=all&search=' + encodeURIComponent(gene) + '" target="_blank" rel="noopener" class="ext-link-pill"><span class="ext-link-icon">🤖</span> ChEMBL ↗</a>';
      html += '    <a href="https://www.guidetopharmacology.org/search?search_type=all&query=' + encodeURIComponent(gene) + '" target="_blank" rel="noopener" class="ext-link-pill"><span class="ext-link-icon">📝</span> GuideToPharm ↗</a>';
      html += '    <a href="https://www.rcsb.org/search?q=' + encodeURIComponent(gene) + '" target="_blank" rel="noopener" class="ext-link-pill"><span class="ext-link-icon">🔭</span> PDB ↗</a>';
    }
    html += '    <a href="https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(target.name + ' inhibitor') + '" target="_blank" rel="noopener" class="ext-link-pill"><span class="ext-link-icon">📄</span> PubMed ↗</a>';
    html += '  </div>';
    html += '</div>';

    if (functionText) {
      html += '<div class="detail-section">';
      html += '  <h2 class="detail-section-title">Protein Function · 蛋白功能</h2>';
      html += '  <p class="function-text">' + escapeHtml(functionText) + '</p>';
      if (gene && target.uniprot) {
        html += '  <p class="function-source"><a href="https://www.uniprot.org/uniprotkb/' + target.uniprot + '/entry" target="_blank" rel="noopener">Source: UniProt</a></p>';
      }
      html += '</div>';
    }

    // Disease Association section
    var diseaseInfo = getDiseaseInfo(target.name, target.gene, target.uniprot);
    if (diseaseInfo) {
      html += '<div class="detail-section">';
      html += '  <h2 class="detail-section-title">Disease Association · 疾病关联</h2>';
      html += '  <div class="disease-container">';
      // Associated diseases
      html += '    <div class="disease-block">';
      html += '      <div class="disease-block-label">Associated Diseases · 相关疾病</div>';
      html += '      <div class="disease-tags">';
      diseaseInfo.diseases.forEach(function(d) {
        html += '        <span class="disease-tag">' + escapeHtml(d) + '</span>';
      });
      html += '      </div>';
      html += '    </div>';
      // Drug target status
      html += '    <div class="disease-block">';
      html += '      <div class="disease-block-label">Drug Target Status · 药靶状态</div>';
      html += '      <div class="disease-drug-status">';
      var statusColor = '#78909c';
      if (diseaseInfo.drugStatus === 'Approved') statusColor = '#2e7d32';
      else if (diseaseInfo.drugStatus === 'Clinical') statusColor = '#e65100';
      else if (diseaseInfo.drugStatus === 'Withdrawn') statusColor = '#c62828';
      html += '        <span class="drug-status-badge" style="background:' + statusColor + '18;color:' + statusColor + ';border-color:' + statusColor + '40;">' + escapeHtml(diseaseInfo.drugStatus) + '</span>';
      if (diseaseInfo.approvedDrugs && diseaseInfo.approvedDrugs.length > 0) {
        html += '        <span style="color:var(--text-muted);margin:0 6px;font-size:12px;">|</span>';
        html += '        <span style="font-size:12px;color:var(--text-secondary);font-weight:500;">Approved drugs:</span>';
        diseaseInfo.approvedDrugs.forEach(function(dr, i) {
          html += '        <span class="drug-name-pill">' + escapeHtml(dr) + '</span>';
        });
      }
      html += '      </div>';
      html += '    </div>';
      html += '  </div>';
      if (target.gene) {
        html += '  <p class="function-source"><a href="https://www.uniprot.org/uniprotkb/' + target.uniprot + '/entry#disease" target="_blank" rel="noopener">Source: UniProt Disease & Phenotypes</a></p>';
      }
      html += '</div>';
    }

    if (pathways && pathways.length > 0) {
      html += '<div class="detail-section">';
      html += '  <h2 class="detail-section-title">KEGG Pathways · 代谢通路</h2>';
      html += '  <div class="kegg-list">';
      pathways.forEach(function (pw) {
        var parts = pw.split(':');
        var pid = parts[0] || '';
        var pname = parts[1] || pw;
        html += '    <a href="https://www.kegg.jp/entry/' + pid + '" target="_blank" rel="noopener" class="kegg-item">';
        html += '      <span class="kegg-id">' + pid + '</span>';
        html += '      <span class="kegg-name">' + escapeHtml(pname) + '</span>';
        html += '      <span class="kegg-arrow">↗</span>';
        html += '    </a>';
      });
      html += '  </div>';
      html += '</div>';
    }

    html += '<div class="detail-section">';
    html += '  <h2 class="detail-section-title">Active Compounds · 活性化合物 <span class="section-count">' + target.compound_count + '</span></h2>';
    html += '  <div class="potency-tabs" id="potency-tabs">';
    html += '    <button class="potency-tab active" data-range="all">All (' + sortedCpds.length + ')</button>';
    html += '    <button class="potency-tab" data-range="high">≤1 nM</button>';
    html += '    <button class="potency-tab" data-range="mid">1–100 nM</button>';
    html += '    <button class="potency-tab" data-range="low">>100 nM</button>';
    html += '  </div>';
    html += '  <table class="cpd-table" id="cpd-sort-table">';
    html += '    <thead><tr>';
    html += '      <th style="width:36px">Str</th>';
    html += '      <th class="sortable-th" data-sort="name">Compound · 化合物 <span class="sort-arrow"></span></th>';
    html += '      <th class="sortable-th" data-sort="formula">Formula · 分子式 <span class="sort-arrow"></span></th>';
    html += '      <th class="sortable-th" data-sort="mw" style="width:90px">MW · 分子量 <span class="sort-arrow"></span></th>';
    html += '      <th class="sortable-th" data-sort="activity">Activity · 活性数据 <span class="sort-arrow"></span></th>';
    html += '      <th>Reference · 文献</th>';
    html += '      <th class="sortable-th" data-sort="chemotype">Chemotype <span class="sort-arrow"></span></th>';
    html += '      <th class="sortable-th" data-sort="potency" style="width:72px">Potency <span class="sort-arrow"></span></th>';
    html += '    </tr></thead>';
    html += '    <tbody id="cpd-list"></tbody>';
    html += '  </table>';
    html += '</div>';

    container.innerHTML = html;
    document.title = target.name + ' — Deep-Sea Compound Database';

    sortState.field = 'potency';
    sortState.dir = 1;
    var sortedCpds = sortCompounds(target.compounds);
    var cpdList = document.getElementById('cpd-list');

    function renderCpdTableBody(cpds, container) {
      container.innerHTML = '';
      if (cpds.length === 0) {
        container.innerHTML = '<div class="empty-state">No compounds in this range</div>';
      } else {
        cpds.forEach(function (c) { container.innerHTML += renderCpdRow(c); });
      }
    }

    // Initial render
    renderCpdTableBody(sortedCpds, cpdList);

    // Mark initial sort indicator on Potency column
    var initThs = document.querySelectorAll('#cpd-sort-table .sortable-th');
    initThs.forEach(function (th) {
      if (th.dataset.sort === 'potency') {
        th.classList.add('sort-active');
        var arrow = th.querySelector('.sort-arrow');
        if (arrow) arrow.textContent = '▲';
      }
    });

    function filterAndRender(range, list) {
      range = range || 'all';
      var filtered;
      if (range === 'all') {
        filtered = list;
      } else {
        filtered = list.filter(function (c) {
          var v = parseIC50nM(c.ic50);
          if (v === null) return range === 'low';
          if (range === 'high') return v <= 1;
          if (range === 'mid') return v > 1 && v <= 100;
          if (range === 'low') return v > 100;
          return true;
        });
      }
      renderCpdTableBody(filtered, cpdList);
    }

    var tabs = document.getElementById('potency-tabs');
    if (tabs && cpdList) {
      tabs.addEventListener('click', function (e) {
        var tab = e.target.closest('.potency-tab');
        if (!tab) return;
        tabs.querySelectorAll('.potency-tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        filterAndRender(tab.dataset.range, sortedCpds);
      });
    }

    // Sortable columns
    var sortTable = document.getElementById('cpd-sort-table');
    if (sortTable) {
      sortTable.addEventListener('click', function (e) {
        var th = e.target.closest('.sortable-th');
        if (!th) return;
        var field = th.dataset.sort;
        if (sortState.field === field) {
          sortState.dir = -sortState.dir;
        } else {
          sortState.field = field;
          sortState.dir = 1;
        }
        sortedCpds = sortCompounds(target.compounds);
        initThs.forEach(function (t) {
          t.classList.remove('sort-active');
          var a = t.querySelector('.sort-arrow');
          if (a) a.textContent = '';
        });
        th.classList.add('sort-active');
        var arrow = th.querySelector('.sort-arrow');
        if (arrow) arrow.textContent = sortState.dir === 1 ? '▲' : '▼';
        var activeTab = tabs ? tabs.querySelector('.potency-tab.active') : null;
        filterAndRender(activeTab ? activeTab.dataset.range : 'all', sortedCpds);
      });
    }
  }

  function renderCpdRow(cpd) {
    var img = imgUrl(cpd.cid, cpd.smiles, 's');
    var ctColor = getCtColor(cpd.chemotype);
    var potency = parseIC50nM(cpd.ic50);
    var badge = '';
    if (potency !== null) {
      if (potency <= 1) badge = '<span class="potency-badge high">High</span>';
      else if (potency <= 100) badge = '<span class="potency-badge mid">Moderate</span>';
      else badge = '<span class="potency-badge low">Weak</span>';
    }
    var cpdLink = '../1-Compounds/' + (cpd.file || '#');
    var html = '<tr onclick="window.location=\'' + cpdLink.replace(/'/g, "\\'") + '\'">';
    html += '  <td class="cpd-td-img" data-label="Str">';
    if (img) html += '    <img src="' + img + '" alt="" loading="lazy">';
    else html += '    <span class="fallback">?</span>';
    html += '  </td>';
    html += '  <td data-label="Compound">';
    html += '    <a href="' + cpdLink + '" class="cpd-td-name">' + escapeHtml(cpd.name) + '</a>';
    if (cpd.ic50) html += '    <div class="cpd-td-sub">' + escapeHtml(cpd.ic50) + '</div>';
    html += '  </td>';
    html += '  <td data-label="Formula">';
    if (cpd.formula) html += '<span class="cpd-td-formula">' + escapeHtml(cpd.formula) + '</span>';
    else html += '<span style="color:var(--text-muted);font-size:12px;">—</span>';
    html += '  </td>';
    html += '  <td data-label="MW">';
    if (cpd.mw) html += '<span class="cpd-td-mw">' + escapeHtml(cpd.mw.replace(' g/mol','')) + '</span>';
    else html += '<span style="color:var(--text-muted);font-size:12px;">—</span>';
    html += '  </td>';
    html += '  <td data-label="Activity">';
    if (cpd.ic50) html += '<span class="cpd-td-activity">' + escapeHtml(cpd.ic50) + '</span>';
    else html += '<span style="color:var(--text-muted);font-size:12px;">—</span>';
    html += '  </td>';
    html += '  <td data-label="Reference">';
    var refs = [];
    if (cpd.pmid) refs.push('<a href="https://pubmed.ncbi.nlm.nih.gov/' + cpd.pmid + '/" target="_blank" class="cpd-td-pmid" onclick="event.stopPropagation()">PMID: ' + cpd.pmid + ' ↗</a>');
    if (cpd.chembl) refs.push('<a href="https://www.ebi.ac.uk/chembl/compound_report_card/' + cpd.chembl + '/" target="_blank" class="cpd-td-pmid cpd-td-chembl" onclick="event.stopPropagation()" title="' + cpd.chembl + '">ChEMBL ↗</a>');
    if (refs.length > 0) html += refs.join('<br>');
    else html += '<span style="color:var(--text-muted);font-size:12px;">—</span>';
    html += '  </td>';
    html += '  <td data-label="Chemotype">';
    if (cpd.chemotype) html += '<span class="cpd-td-chemotype" style="background:' + ctColor + '18;color:' + ctColor + '">' + escapeHtml(cpd.chemotype) + '</span>';
    else html += '<span style="color:var(--text-muted);font-size:12px;">—</span>';
    html += '  </td>';
    html += '  <td class="cpd-td-potency" data-label="Potency">' + badge + '</td>';
    html += '</tr>';
    return html;
  }

  function init() {
    initBrowse();
    initDetail();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
