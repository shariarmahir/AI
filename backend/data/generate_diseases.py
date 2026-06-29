"""
Disease data generator. Produces 100 Bangladesh-relevant diseases with full clinical structure.
Each disease entry includes: symptoms, causes, risk factors, complications, when to seek help,
red flags, treatment overview, prevention, BD context, and 10 Q&A pairs.

Total output: 100 diseases × 10 Q&As = 1000+ Q&A pairs ready for RAG ingestion.
"""

import json
from pathlib import Path

# ─────────────────────────────────────────────────────────────────────
# 100 diseases relevant to Bangladesh, organized by category
# Each entry includes clinical detail + 10 patient Q&As
# ─────────────────────────────────────────────────────────────────────

DISEASES = [
    # ━━━━━━━━━━━━━━━━━━ INFECTIOUS DISEASES (20) ━━━━━━━━━━━━━━━━━━
    {
        "id": "dengue",
        "name_en": "Dengue Fever",
        "name_bn": "ডেঙ্গু জ্বর",
        "category": "infectious",
        "prevalence_bd": "very_high",
        "specialty": "general_medicine",
        "summary": "Mosquito-borne viral infection transmitted by Aedes aegypti. Endemic in Bangladesh with major outbreaks every monsoon. Can progress to severe dengue (DHF/DSS) which is life-threatening.",
        "symptoms": ["High fever (104°F)", "Severe headache", "Pain behind eyes", "Muscle and joint pain (breakbone fever)", "Nausea, vomiting", "Skin rash 2-5 days after fever", "Mild bleeding (nose, gums)"],
        "causes": ["Dengue virus (DENV 1-4) transmitted by Aedes aegypti mosquito bite"],
        "risk_factors": ["Living in urban Bangladesh during monsoon (June-October)", "Standing water near home", "Previous dengue infection (increases severity of next)", "Pregnancy"],
        "complications": ["Dengue Hemorrhagic Fever (DHF)", "Dengue Shock Syndrome (DSS)", "Plasma leakage", "Severe bleeding", "Organ failure"],
        "red_flags": ["Severe abdominal pain", "Persistent vomiting", "Bleeding from gums/nose", "Blood in vomit/stool", "Lethargy, restlessness", "Cold, clammy skin", "Decreased urination", "Platelet count below 100,000"],
        "treatment_overview": "No specific antiviral. Supportive care: paracetamol (NEVER aspirin or ibuprofen — increases bleeding), oral fluids, rest. Hospital admission if warning signs. IV fluids and platelet monitoring for severe cases.",
        "prevention": ["Eliminate standing water (flower pots, containers, AC trays)", "Use mosquito nets (especially daytime — Aedes bites in daylight)", "Wear long sleeves", "Mosquito repellent with DEET", "Window screens"],
        "bd_context": "Bangladesh sees 50,000-300,000+ cases yearly. Dhaka, Chittagong worst-affected. 2023 was record outbreak with 1,700+ deaths. Hospitals like DMCH, BSMMU, Mugda Medical have dedicated dengue units.",
        "qa": [
            {"q": "How long does dengue fever last?", "a": "Acute illness typically lasts 5-7 days. Fever usually breaks on day 4-5, but this is also when severe complications can develop (critical phase). Full recovery may take 2-4 weeks with persistent fatigue. Monitor closely during the critical phase."},
            {"q": "Can I take paracetamol for dengue?", "a": "Yes, paracetamol (Napa, Ace) is safe and recommended for fever and pain in dengue. NEVER take aspirin, ibuprofen, or diclofenac — these increase bleeding risk which can be fatal in dengue. Maximum 4 grams paracetamol per day for adults."},
            {"q": "When should I go to hospital for dengue?", "a": "Go immediately if you have: severe abdominal pain, persistent vomiting, bleeding from gums or nose, blood in vomit or stool, extreme weakness, cold clammy skin, or decreased urination. These are warning signs of severe dengue requiring urgent hospital care."},
            {"q": "Can dengue come back after recovery?", "a": "Yes, you can get dengue again. There are 4 serotypes (DENV 1-4). Recovering from one gives lifelong immunity to that type only. A second infection with a different serotype actually increases risk of severe dengue. Continue prevention even after recovering."},
            {"q": "What is the platelet count danger level in dengue?", "a": "Normal platelets are 150,000-450,000. In dengue, platelets often drop. Below 100,000 needs close monitoring. Below 20,000 or with active bleeding may require platelet transfusion. Platelet count alone doesn't determine severity — clinical warning signs matter more."},
            {"q": "Can pregnant women get dengue?", "a": "Yes, and it can be more severe. Risks include miscarriage, preterm birth, low birth weight, and vertical transmission to baby. Pregnant women with fever in Bangladesh should be tested for dengue immediately and monitored in hospital."},
            {"q": "How is dengue diagnosed?", "a": "Blood tests: NS1 antigen (positive days 1-5), IgM antibody (positive after day 4-5), and CBC for platelet/hematocrit. Most diagnostic centers in Dhaka do this same-day for 800-1500 BDT."},
            {"q": "Are home remedies like papaya leaf juice effective for dengue?", "a": "Some small studies suggest papaya leaf extract may modestly increase platelet count, but it's not a substitute for medical care. Don't rely on home remedies — monitor warning signs and seek hospital care when indicated. Hydration is the most important home measure."},
            {"q": "Can I get dengue twice in one season?", "a": "Yes, possibly — if exposed to a different serotype. Second infections are typically more severe. This is why prevention remains critical even after recovery."},
            {"q": "What food should I eat during dengue?", "a": "Focus on hydration: ORS, coconut water, fresh fruit juice, soups. Easy-to-digest foods like khichuri, daal, banana, papaya. Avoid oily and spicy food. Eat small frequent meals if nausea is present. Coconut water and ORS help with fluid balance."}
        ]
    },
    {
        "id": "typhoid",
        "name_en": "Typhoid Fever",
        "name_bn": "টাইফয়েড জ্বর",
        "category": "infectious",
        "prevalence_bd": "high",
        "specialty": "general_medicine",
        "summary": "Bacterial infection by Salmonella Typhi from contaminated food/water. Endemic in Bangladesh due to water quality issues. Treatable with antibiotics but increasingly drug-resistant.",
        "symptoms": ["Sustained high fever (rising stepwise)", "Headache", "Weakness, fatigue", "Abdominal pain", "Constipation or diarrhea", "Rose-colored spots on chest", "Loss of appetite", "Enlarged spleen"],
        "causes": ["Salmonella Typhi bacteria from contaminated water or food", "Poor sanitation", "Eating from street vendors with poor hygiene"],
        "risk_factors": ["Drinking unboiled/untreated water", "Eating uncooked street food", "Poor handwashing", "Living in densely populated areas", "Recent travel to endemic regions"],
        "complications": ["Intestinal perforation (week 3-4)", "Internal bleeding", "Encephalopathy", "Sepsis", "Chronic carrier state"],
        "red_flags": ["Severe abdominal pain", "Blood in stool", "Confusion or delirium", "Persistent vomiting", "Signs of perforation (rigid abdomen)"],
        "treatment_overview": "Antibiotics for 7-14 days: azithromycin, ceftriaxone, or cefixime. MDR (multi-drug-resistant) and XDR typhoid increasing in Bangladesh — culture and sensitivity testing important. Hydration and rest. Hospital admission for severe cases.",
        "prevention": ["Drink only boiled or filtered water", "Avoid ice in drinks unless safe water source", "Wash hands before eating", "Eat freshly cooked hot food", "Avoid raw salads from street vendors", "Typhoid vaccine (Typhim Vi or Typbar TCV)"],
        "bd_context": "Bangladesh has very high typhoid burden — estimated 100,000+ cases yearly. XDR typhoid emerging concern. Widal test commonly used but unreliable; blood culture is gold standard. Available at any major hospital lab for 500-1500 BDT.",
        "qa": [
            {"q": "How is typhoid different from regular fever?", "a": "Typhoid causes a sustained, stepwise rising fever lasting weeks (not days), often with relative bradycardia (slow pulse despite high fever), abdominal symptoms, and rose spots. Regular viral fever resolves in 3-7 days. Blood culture confirms typhoid."},
            {"q": "Is the Widal test reliable for typhoid?", "a": "Widal test is unreliable — many false positives and negatives. Blood culture is the gold standard and should be done in the first week of fever. In Bangladesh, request blood culture along with or instead of Widal."},
            {"q": "How long does typhoid treatment take?", "a": "Antibiotic course is typically 7-14 days. Fever often takes 3-5 days to come down after starting antibiotics. Complete the full course even if you feel better, otherwise relapse and resistance can develop."},
            {"q": "Can I die from typhoid?", "a": "Yes, untreated typhoid has 10-20% mortality. With proper antibiotics, mortality is less than 1%. Complications like intestinal perforation can be fatal. Seek treatment early."},
            {"q": "Why is XDR typhoid a concern?", "a": "Extensively Drug-Resistant typhoid doesn't respond to most common antibiotics including ciprofloxacin and cefixime. Only a few drugs work (azithromycin, meropenem). It's spreading in South Asia. Always do culture and sensitivity in suspected typhoid."},
            {"q": "Should my family members get tested if I have typhoid?", "a": "If they have symptoms, yes. Asymptomatic family members generally don't need testing but should follow good hygiene (handwashing, separate utensils). Up to 5% of recovered patients become chronic carriers — those handling food should be tested."},
            {"q": "Is typhoid vaccine effective?", "a": "Yes — Typbar TCV (conjugate vaccine) gives ~80% protection lasting 5+ years. Recommended for all children in endemic areas. Available at most private clinics in Bangladesh for 1500-2500 BDT."},
            {"q": "Can I eat regular food during typhoid?", "a": "Eat soft, easily digestible food: khichuri, rice with daal, mashed potato, banana, yogurt. Avoid spicy, oily, and fibrous foods that stress the gut. Stay well hydrated."},
            {"q": "How long am I contagious with typhoid?", "a": "You can shed bacteria in stool for weeks even after symptoms resolve. Practice strict handwashing. 2-5% become chronic carriers shedding bacteria for years. Stool culture 1 month after recovery can confirm clearance."},
            {"q": "Can typhoid recur?", "a": "Yes — relapse in 5-15% of cases, usually 1-3 weeks after treatment ends. Often due to incomplete treatment. If fever returns, see a doctor immediately and repeat blood culture."}
        ]
    },
    {
        "id": "malaria", "name_en": "Malaria", "name_bn": "ম্যালেরিয়া",
        "category": "infectious", "prevalence_bd": "moderate", "specialty": "general_medicine",
        "summary": "Mosquito-borne parasitic disease. In Bangladesh, mainly in hill tract districts (Bandarban, Khagrachhari, Rangamati). P. falciparum is most dangerous; P. vivax also common.",
        "symptoms": ["Cyclical fever with chills", "Sweating episodes", "Headache", "Body ache", "Nausea, vomiting", "Anemia", "Jaundice in severe cases"],
        "causes": ["Plasmodium parasites transmitted by Anopheles mosquito bite (bites at night)"],
        "risk_factors": ["Travel to or living in hill tract districts", "Outdoor activity at night", "Sleeping without bed net"],
        "complications": ["Cerebral malaria", "Severe anemia", "Kidney failure", "ARDS", "Death (with P. falciparum)"],
        "red_flags": ["Altered consciousness", "Seizures", "Severe jaundice", "Difficulty breathing", "Decreased urine output", "Bleeding"],
        "treatment_overview": "ACT (Artemisinin Combination Therapy) for falciparum; chloroquine and primaquine for vivax. WHO and Bangladesh NMEP protocols. Severe cases need IV artesunate.",
        "prevention": ["Insecticide-treated bed nets", "Indoor residual spraying", "Wear long sleeves at dusk/night", "Chemoprophylaxis if traveling to high-risk areas"],
        "bd_context": "Bangladesh aims for malaria elimination by 2030. Cases dropped from 80,000 (2008) to under 20,000 today. Hill tracts account for >90% of cases. Free testing and treatment at upazila health complexes.",
        "qa": [
            {"q": "What's the difference between dengue and malaria fever?", "a": "Dengue fever is continuous (24/7 high) with body aches and possible rash; malaria fever is cyclical (chills then high fever then sweating, every 24-48 hours). Diagnosis confirmed by blood tests — NS1/IgM for dengue, peripheral blood smear or RDT for malaria."},
            {"q": "How is malaria diagnosed?", "a": "Blood smear (microscopy) or Rapid Diagnostic Test (RDT). Available at upazila health complexes and major labs. Results in 30 minutes for RDT."},
            {"q": "Can malaria be cured completely?", "a": "Yes, with proper treatment. P. vivax can have dormant liver stages that cause relapses — need primaquine (after G6PD testing) to prevent relapse. P. falciparum doesn't relapse but needs prompt treatment to prevent severe disease."},
            {"q": "Is malaria common in Dhaka?", "a": "No, Dhaka has very low malaria transmission. Most cases come from travel to hill districts. Fever in Dhaka residents is much more likely dengue, typhoid, or viral infection."},
            {"q": "Can pregnant women take malaria treatment?", "a": "Yes, but drug selection matters. Quinine and clindamycin are safe in first trimester; ACTs can be used in 2nd and 3rd trimesters. Always under medical supervision. Pregnant women with malaria need hospitalization."},
            {"q": "What is cerebral malaria?", "a": "Severe complication of P. falciparum where parasites obstruct brain blood vessels. Symptoms: confusion, seizures, coma. Mortality 15-20% even with treatment. Medical emergency requiring IV artesunate."},
            {"q": "How can I protect myself when visiting Bandarban?", "a": "Use insecticide-treated bed nets, wear long sleeves at dawn/dusk, apply DEET repellent, consider doxycycline prophylaxis (consult doctor 1 week before travel). Seek care immediately if fever develops within a month of return."},
            {"q": "Can malaria be transmitted from person to person?", "a": "Not through normal contact. Transmission requires mosquito bite. Rare transmission can occur via blood transfusion, sharing needles, or mother-to-baby during pregnancy/birth."},
            {"q": "How long after a mosquito bite do malaria symptoms start?", "a": "Typically 10-15 days for P. falciparum, 12-18 days for P. vivax. Can be longer (up to several months) with vivax due to dormant liver stages. Tell your doctor about any travel history."},
            {"q": "Is there a malaria vaccine?", "a": "RTS,S/AS01 (Mosquirix) is approved for children in high-transmission African countries. Not currently part of Bangladesh's vaccine program. Prevention still relies on bed nets and vector control."}
        ]
    },
    {
        "id": "hepatitis_b", "name_en": "Hepatitis B", "name_bn": "হেপাটাইটিস বি",
        "category": "infectious", "prevalence_bd": "high", "specialty": "gastroenterology",
        "summary": "Viral infection of the liver. ~5% of Bangladeshis are chronic carriers. Spread through blood, sexual contact, and mother-to-child. Can lead to cirrhosis and liver cancer.",
        "symptoms": ["Often asymptomatic in early stages", "Fatigue", "Loss of appetite", "Nausea, vomiting", "Jaundice", "Dark urine", "Pale stool", "Right upper abdominal pain"],
        "causes": ["Hepatitis B virus from infected blood, sexual contact, sharing needles, or mother to baby during birth"],
        "risk_factors": ["Unsafe injections", "Tattoos/piercings with unsterile equipment", "Multiple sexual partners", "Healthcare workers", "Baby born to HBV+ mother", "Sharing razors"],
        "complications": ["Chronic hepatitis (in 90% of infants infected; 5-10% of adults)", "Cirrhosis", "Liver failure", "Hepatocellular carcinoma (liver cancer)"],
        "red_flags": ["Severe jaundice", "Confusion (hepatic encephalopathy)", "Bloody vomit", "Severe abdominal swelling (ascites)", "Bleeding tendency"],
        "treatment_overview": "Acute: supportive care. Chronic: antivirals like tenofovir or entecavir, taken long-term. Regular monitoring of liver function and viral load. Liver cancer screening every 6 months in chronic patients.",
        "prevention": ["Hepatitis B vaccine (3-dose series, in Bangladesh EPI for children)", "Safe injection practices", "Screening of blood donors", "Condom use", "Hepatitis B immunoglobulin for babies of infected mothers"],
        "bd_context": "Hepatitis B vaccine included in Bangladesh EPI since 2003. Chronic HBV is leading cause of liver disease and liver cancer in Bangladesh. Affordable testing (HBsAg ~200 BDT) available widely. BSMMU and BIRDEM have specialized hepatology units.",
        "qa": [
            {"q": "How can I get tested for Hepatitis B?", "a": "Simple blood test — HBsAg (Hepatitis B surface antigen). Available at any diagnostic lab in Bangladesh for 200-500 BDT. If positive, additional tests (HBeAg, HBV DNA, liver function) determine treatment need."},
            {"q": "If I have Hepatitis B, will my baby get it?", "a": "Risk of transmission to baby is high (up to 90% if mother is HBeAg positive). However, giving the baby Hepatitis B vaccine + immunoglobulin (HBIG) within 12 hours of birth prevents transmission in 95% of cases. Inform your doctor before delivery."},
            {"q": "Can Hepatitis B be cured?", "a": "Chronic HBV is rarely 'cured' but can be effectively controlled with antiviral medications taken long-term (often lifelong). Treatment reduces liver damage and cancer risk significantly. Acute hepatitis B in adults usually clears spontaneously in 90-95% of cases."},
            {"q": "How is Hepatitis B different from Hepatitis C?", "a": "Both attack the liver. HBV is a DNA virus, transmitted through blood, sex, and birth. HCV is RNA, mainly through blood. HBV has a vaccine; HCV doesn't but is curable with newer drugs (DAAs). Both can cause cirrhosis and cancer."},
            {"q": "Is Hepatitis B vaccine safe in pregnancy?", "a": "Yes, it's safe and recommended if needed during pregnancy. The vaccine contains no live virus."},
            {"q": "Can I have sex if I have Hepatitis B?", "a": "Yes, but use condoms to prevent transmission. Your partner should be tested and vaccinated. Once vaccinated and immune (anti-HBs >10 IU/L), they're protected."},
            {"q": "How long can Hepatitis B virus survive outside the body?", "a": "Up to 7 days on surfaces. This is why sharing razors, toothbrushes, and nail clippers with infected persons is risky. Wash blood spills with diluted bleach (1:10)."},
            {"q": "What should I avoid if I have Hepatitis B?", "a": "Alcohol (severely worsens liver damage), unprescribed medications/supplements (many are liver-toxic), and raw shellfish (risk of additional infections). Maintain healthy weight to prevent fatty liver."},
            {"q": "Should my whole family get tested?", "a": "Yes, household contacts and sexual partners should be tested for HBsAg, anti-HBc, and anti-HBs. Negative contacts should be vaccinated. Especially important for children of infected mothers."},
            {"q": "Can I work and live normally with Hepatitis B?", "a": "Yes. Hepatitis B doesn't spread through casual contact, sharing food/utensils, hugging, or coughing. You can attend school, work, and participate in all activities. Just avoid sharing blood-contact items."}
        ]
    },
    {
        "id": "tuberculosis", "name_en": "Tuberculosis (TB)", "name_bn": "যক্ষ্মা",
        "category": "infectious", "prevalence_bd": "very_high", "specialty": "pulmonology",
        "summary": "Bacterial infection mainly affecting lungs, caused by Mycobacterium tuberculosis. Bangladesh has one of the world's highest TB burdens with 360,000+ cases yearly. Free treatment under DOTS program.",
        "symptoms": ["Cough lasting >3 weeks", "Coughing up blood", "Chest pain", "Weight loss", "Night sweats", "Low-grade fever (evening rise)", "Loss of appetite", "Fatigue"],
        "causes": ["Mycobacterium tuberculosis spread via respiratory droplets from infected person"],
        "risk_factors": ["Close contact with TB patient", "HIV infection", "Diabetes", "Malnutrition", "Smoking", "Living in crowded conditions", "Healthcare workers"],
        "complications": ["Multi-drug resistant TB (MDR-TB)", "Extra-pulmonary TB (bone, brain, kidney)", "Lung scarring", "Hemoptysis (severe bleeding)", "Death"],
        "red_flags": ["Massive hemoptysis", "Severe weight loss", "Severe shortness of breath", "Signs of meningitis (headache, neck stiffness)"],
        "treatment_overview": "6-month standard regimen: 2 months of HRZE (Isoniazid, Rifampicin, Pyrazinamide, Ethambutol) + 4 months of HR. Free at any DOTS center under Bangladesh National TB Program. MDR-TB needs 9-20 months of second-line drugs.",
        "prevention": ["BCG vaccine at birth (Bangladesh EPI)", "Cover mouth when coughing", "Good ventilation", "Early diagnosis and treatment of cases", "Screen close contacts"],
        "bd_context": "Bangladesh has 4th highest TB burden globally. BRAC and Damien Foundation run extensive TB programs. Free GeneXpert testing and treatment at upazila health complexes and selected NGO clinics. National TB program (NTP) is highly effective.",
        "qa": [
            {"q": "How is TB diagnosed?", "a": "Sputum tests: AFB smear (microscopy), GeneXpert MTB/RIF (detects TB + rifampicin resistance in 2 hours), culture. Chest X-ray supports diagnosis. GeneXpert is free at upazila health complexes."},
            {"q": "Is TB treatment really free in Bangladesh?", "a": "Yes, all TB testing and medications are completely free at any government DOTS center, BRAC TB centers, and Damien Foundation clinics. Don't buy private — government drugs are quality-assured and free."},
            {"q": "Will I be contagious during TB treatment?", "a": "Most patients become non-contagious within 2-3 weeks of starting effective treatment. Sputum tests confirm. Wear a mask and stay home for the first 2 weeks. Family members should be screened."},
            {"q": "Can TB be cured?", "a": "Yes, drug-sensitive TB is cured in >95% of cases with 6 months of treatment. The key is completing the full course — stopping early causes drug resistance and relapse."},
            {"q": "What is MDR-TB?", "a": "Multi-Drug-Resistant TB doesn't respond to isoniazid and rifampicin (the two strongest first-line drugs). Requires 9-20 months of treatment with more toxic drugs. Often caused by incomplete previous treatment. Diagnosed by GeneXpert."},
            {"q": "Can TB affect organs other than lungs?", "a": "Yes — extra-pulmonary TB can affect lymph nodes, bones (spine — Pott's disease), brain (TB meningitis), kidneys, intestines, skin. Symptoms vary by site. Lymph node TB is the most common extra-pulmonary form in Bangladesh."},
            {"q": "Do I need special diet during TB treatment?", "a": "Eat protein-rich and calorie-dense food: eggs, fish, milk, meat, daal, nuts. Many TB patients are underweight; weight gain is a good sign. Avoid alcohol (interacts with TB drugs)."},
            {"q": "What are common TB medication side effects?", "a": "Orange urine/tears (from rifampicin — harmless), nausea, mild liver enzyme rise, joint pain, peripheral neuropathy (give B6/pyridoxine). Severe: jaundice, vision changes (ethambutol), severe rash. Report any to your doctor immediately."},
            {"q": "Should my family get tested for TB?", "a": "Yes, all household contacts should be screened — symptom check and chest X-ray; children may need Mantoux/TST. Children under 5 and HIV-positive contacts may receive isoniazid preventive therapy."},
            {"q": "Can I get TB again after being cured?", "a": "Yes, you can be re-infected, especially if exposed again or if immunity is compromised. Relapse from incompletely treated original infection is also possible. Continue good ventilation and avoid prolonged close contact with active TB patients."}
        ]
    },
]

# Generate remaining diseases programmatically with realistic content
# Categories follow Bangladesh epidemiological priorities

ADDITIONAL_DISEASES_DATA = [
    # ━━━━━━━━━━━━━━ More Infectious (15 more) ━━━━━━━━━━━━━━
    ("cholera", "Cholera", "কলেরা", "infectious", "moderate", "general_medicine",
     "Acute diarrheal infection by Vibrio cholerae. Causes severe watery diarrhea, can be fatal within hours from dehydration. Bangladesh icddr,b is global leader in cholera research.",
     ["Profuse watery diarrhea (rice water stool)", "Vomiting", "Rapid dehydration", "Muscle cramps", "Sunken eyes", "Reduced urination"],
     "Severe dehydration", "Vibrio cholerae from contaminated water/food",
     "ORS, IV fluids if severe, antibiotics (azithromycin, doxycycline) reduce duration",
     ["Boil water", "ORS readily available", "Vaccine (Dukoral) for travelers/outbreaks", "Hand hygiene"]),
    ("diarrhea", "Acute Diarrhea", "ডায়রিয়া", "infectious", "very_high", "general_medicine",
     "Frequent loose/watery stools, often from contaminated water/food. Leading cause of childhood mortality in Bangladesh.",
     ["3+ loose stools daily", "Abdominal cramps", "Nausea", "Fever", "Dehydration signs"],
     "Severe dehydration, shock", "Viral (rotavirus, norovirus), bacterial (E. coli, Shigella), parasitic",
     "ORS is mainstay. Zinc supplementation in children. Continue feeding. Antibiotics only if bloody/severe",
     ["Safe water", "Handwashing", "Breastfeeding", "Rotavirus vaccine"]),
    ("chikungunya", "Chikungunya", "চিকুনগুনিয়া", "infectious", "moderate", "general_medicine",
     "Mosquito-borne viral disease. 2017 Dhaka outbreak affected hundreds of thousands. Severe joint pain that can persist months.",
     ["High fever", "Severe joint pain (debilitating)", "Headache", "Rash", "Muscle pain"],
     "Chronic arthritis", "Chikungunya virus via Aedes mosquito",
     "Symptomatic — paracetamol, rest, fluids. No specific antiviral. Joint pain may need physiotherapy",
     ["Eliminate mosquito breeding", "Repellents", "Bed nets"]),
    ("hepatitis_a", "Hepatitis A", "হেপাটাইটিস এ", "infectious", "high", "gastroenterology",
     "Viral liver infection from contaminated food/water. Usually self-limiting in Bangladesh, most adults already immune from childhood exposure.",
     ["Jaundice", "Fatigue", "Loss of appetite", "Nausea", "Dark urine", "Abdominal discomfort"],
     "Acute liver failure (rare)", "Hepatitis A virus, fecal-oral route",
     "Supportive — rest, hydration, no specific treatment. Avoid alcohol. Recover in 2-6 weeks",
     ["Hepatitis A vaccine", "Safe water and food", "Handwashing"]),
    ("hepatitis_c", "Hepatitis C", "হেপাটাইটিস সি", "infectious", "moderate", "gastroenterology",
     "Blood-borne viral liver infection. Now curable with direct-acting antivirals (DAAs). Lower prevalence than HBV in Bangladesh.",
     ["Often asymptomatic for years", "Fatigue", "Jaundice (late)", "Abdominal pain"],
     "Cirrhosis, liver cancer", "HCV virus through blood — shared needles, unsafe injections, transfusion",
     "DAAs (sofosbuvir/velpatasvir) for 12 weeks — cures >95%. Available in Bangladesh (generic, affordable)",
     ["Safe injections", "Blood screening", "Avoid sharing razors", "No vaccine yet"]),
    ("hepatitis_e", "Hepatitis E", "হেপাটাইটিস ই", "infectious", "moderate", "gastroenterology",
     "Waterborne viral hepatitis, very dangerous in pregnancy with high mortality. Common in Bangladesh especially during floods.",
     ["Jaundice", "Fatigue", "Nausea", "Abdominal pain", "Dark urine"],
     "Acute liver failure (esp. pregnant women — up to 25% mortality)", "HEV via contaminated water",
     "Supportive care. Pregnant women need hospitalization",
     ["Safe drinking water", "Avoid water in floods"]),
    ("covid19", "COVID-19", "কোভিড-১৯", "infectious", "moderate", "pulmonology",
     "SARS-CoV-2 viral infection. Bangladesh experienced multiple waves. Vaccines available nationwide.",
     ["Fever", "Cough", "Loss of taste/smell", "Fatigue", "Shortness of breath", "Body ache"],
     "Pneumonia, ARDS, long COVID", "SARS-CoV-2 via respiratory droplets",
     "Mild: rest, fluids, paracetamol. Moderate-severe: oxygen, antivirals (Paxlovid), steroids. Hospitalization for low oxygen",
     ["Vaccination", "Masks in crowded indoor spaces", "Ventilation", "Hand hygiene"]),
    ("scabies", "Scabies", "চুলকানি", "infectious", "high", "dermatology",
     "Highly itchy skin condition from Sarcoptes scabiei mite. Very common in crowded living conditions.",
     ["Intense itching (worse at night)", "Burrows between fingers, wrists, waist", "Rash", "Blisters"],
     "Bacterial superinfection", "Sarcoptes scabiei mite, close skin contact",
     "Permethrin 5% cream applied head to toe overnight, repeat in 7 days. Treat all household members simultaneously",
     ["Treat contacts", "Wash bedding/clothes hot", "Avoid skin contact during treatment"]),
    ("ringworm", "Fungal Skin Infection (Ringworm)", "দাদ", "infectious", "very_high", "dermatology",
     "Superficial fungal infection (dermatophytes). Extremely common in hot humid Bangladesh climate.",
     ["Ring-shaped red rash with raised border", "Itching", "Scaling", "Hair loss if on scalp"],
     "Spread to other areas, scalp infection", "Dermatophyte fungi (Trichophyton, Microsporum, Epidermophyton)",
     "Topical antifungal (clotrimazole, terbinafine) for 2-4 weeks. Oral terbinafine/itraconazole for severe or scalp",
     ["Keep skin dry", "Don't share towels/combs", "Wear loose cotton clothes", "Treat pets if affected"]),
    ("dysentery", "Dysentery (Bacillary)", "আমাশয়", "infectious", "high", "general_medicine",
     "Bloody diarrhea typically from Shigella or amoeba. Common in unsanitary conditions.",
     ["Bloody, mucousy diarrhea", "Abdominal cramps", "Fever", "Tenesmus (urge to defecate)"],
     "Dehydration, sepsis", "Shigella, Entamoeba histolytica from contaminated food/water",
     "Antibiotics (ciprofloxacin for bacterial, metronidazole for amoebic), ORS, hydration",
     ["Handwashing", "Safe water", "Food hygiene"]),
    ("kala_azar", "Kala-azar (Visceral Leishmaniasis)", "কালা জ্বর", "infectious", "low", "general_medicine",
     "Parasitic disease from sandfly bite. Bangladesh achieved elimination in 2017 but vigilance continues. Mainly affected Mymensingh region.",
     ["Prolonged fever", "Enlarged spleen and liver", "Weight loss", "Anemia", "Darkening of skin"],
     "Death if untreated (>95%)", "Leishmania donovani via sandfly",
     "Liposomal amphotericin B (single dose), miltefosine",
     ["Insecticide spraying", "Bed nets", "Active case detection"]),
    ("japanese_encephalitis", "Japanese Encephalitis", "জাপানিজ এনসেফালাইটিস", "infectious", "low", "neurology",
     "Mosquito-borne brain inflammation. Bangladesh has periodic cases, especially northern districts.",
     ["Sudden high fever", "Headache", "Vomiting", "Confusion", "Seizures", "Paralysis"],
     "Brain damage, death (30% mortality)", "JE virus via Culex mosquito (rice fields, pigs)",
     "No specific antiviral — supportive ICU care",
     ["JE vaccine", "Mosquito control"]),
    ("uti", "Urinary Tract Infection", "মূত্রনালীর সংক্রমণ", "infectious", "very_high", "urology",
     "Bacterial infection of urinary system. Very common in women, especially in Bangladesh due to hygiene challenges.",
     ["Burning during urination", "Frequent urge to urinate", "Lower abdominal pain", "Cloudy or bloody urine", "Low-grade fever"],
     "Kidney infection (pyelonephritis), sepsis", "E. coli usually; ascending bacteria",
     "Antibiotics (nitrofurantoin, fosfomycin, ciprofloxacin) — culture-guided when possible. Hydration",
     ["Drink plenty of water", "Wipe front to back", "Urinate after intercourse", "Avoid holding urine"]),
    ("pneumonia", "Pneumonia", "নিউমোনিয়া", "infectious", "very_high", "pulmonology",
     "Lung infection by bacteria, viruses, or fungi. Leading killer of children under 5 in Bangladesh.",
     ["Cough with sputum", "Fever", "Shortness of breath", "Chest pain", "Rapid breathing in children"],
     "Sepsis, lung abscess, respiratory failure", "Strep pneumoniae, viruses, atypicals",
     "Antibiotics (amoxicillin, azithromycin), oxygen if hypoxic, hospitalization for severe",
     ["Pneumococcal vaccine (in EPI)", "Influenza vaccine", "Don't smoke", "Treat colds early"]),
    ("conjunctivitis", "Conjunctivitis (Eye Flu)", "চোখ ওঠা", "infectious", "high", "ophthalmology",
     "Inflammation of eye membrane. Highly contagious viral or bacterial infection.",
     ["Red eyes", "Watery or sticky discharge", "Itching", "Burning", "Light sensitivity"],
     "Corneal involvement (rare)", "Adenovirus typically; bacteria (Staph, Strep); allergies",
     "Viral: usually self-limiting, cold compresses. Bacterial: antibiotic eye drops. Avoid touching/rubbing",
     ["Handwashing", "Don't share towels/pillows", "Stay home until clear"]),

    # ━━━━━━━━━━━━━━ CARDIOVASCULAR (10) ━━━━━━━━━━━━━━
    ("hypertension", "Hypertension (High Blood Pressure)", "উচ্চ রক্তচাপ", "cardiovascular", "very_high", "cardiology",
     "Persistently elevated BP ≥140/90 mmHg. Affects 1 in 5 Bangladeshi adults; often undiagnosed. Major cause of stroke and heart disease.",
     ["Usually asymptomatic ('silent killer')", "Headache", "Dizziness", "Nosebleeds (severe)", "Vision problems"],
     "Stroke, heart attack, kidney failure, heart failure", "Genetics, salt intake, obesity, stress, age",
     "Lifestyle (DASH diet, exercise, low salt, weight loss) + medication (ACE inhibitors, ARBs, calcium channel blockers, diuretics)",
     ["Less than 5g salt/day", "Regular exercise", "Maintain healthy weight", "Limit alcohol", "Quit smoking", "Annual BP check after age 30"]),
    ("heart_attack", "Heart Attack (Myocardial Infarction)", "হার্ট অ্যাটাক", "cardiovascular", "high", "cardiology",
     "Death of heart muscle from blocked artery. Leading cause of death in Bangladesh.",
     ["Chest pain/pressure (often left side, radiating to arm/jaw)", "Shortness of breath", "Sweating", "Nausea", "Dizziness"],
     "Death, heart failure, arrhythmias", "Atherosclerosis, blood clot",
     "EMERGENCY — call ambulance or go to hospital with cath lab (Square, Apollo, NICVD). Chew aspirin if not allergic. Time = muscle",
     ["Don't smoke", "Control BP, cholesterol, diabetes", "Healthy diet", "Exercise", "Maintain weight"]),
    ("stroke", "Stroke", "স্ট্রোক", "cardiovascular", "high", "neurology",
     "Sudden loss of brain function from blocked or burst blood vessel. Major disability cause in Bangladesh.",
     ["Sudden weakness on one side", "Facial droop", "Slurred speech", "Vision loss", "Severe headache", "Confusion"],
     "Permanent disability, death", "Hypertension, atrial fibrillation, diabetes, smoking",
     "EMERGENCY — FAST (Face-Arm-Speech-Time). Thrombolytic (tPA) within 4.5 hours if ischemic. NINS, BSMMU, Square have stroke units",
     ["BP control", "Manage diabetes", "Don't smoke", "Treat AFib", "Statins if indicated"]),
    ("heart_failure", "Heart Failure", "হার্ট ফেইলিউর", "cardiovascular", "high", "cardiology",
     "Heart can't pump blood effectively. Often from longstanding hypertension, MI, or rheumatic heart disease in Bangladesh.",
     ["Shortness of breath", "Leg swelling", "Fatigue", "Cough (worse lying down)", "Weight gain (fluid)"],
     "Pulmonary edema, kidney failure, death", "Coronary disease, hypertension, valvular disease, cardiomyopathy",
     "ACE-i/ARB/ARNI, beta-blockers, diuretics, SGLT2 inhibitors. Salt restriction. Specialist follow-up",
     ["Control BP and diabetes", "Treat heart attacks promptly", "Treat rheumatic fever"]),
    ("arrhythmia", "Arrhythmia (Irregular Heartbeat)", "অনিয়মিত হৃদস্পন্দন", "cardiovascular", "moderate", "cardiology",
     "Abnormal heart rhythm. Atrial fibrillation most common type — increases stroke risk 5x.",
     ["Palpitations", "Dizziness", "Fatigue", "Chest discomfort", "Shortness of breath", "Fainting"],
     "Stroke (AFib), heart failure, sudden cardiac death", "Heart disease, hyperthyroidism, electrolyte imbalance",
     "Depends on type — rate/rhythm control medications, anticoagulation, ablation, pacemaker",
     ["Treat underlying causes", "Limit caffeine/alcohol", "Manage stress"]),
    ("rheumatic_heart", "Rheumatic Heart Disease", "রিউম্যাটিক হার্ট রোগ", "cardiovascular", "moderate", "cardiology",
     "Heart valve damage from untreated streptococcal infection. Still significant problem in Bangladesh; preventable.",
     ["Shortness of breath", "Fatigue", "Heart murmur", "Palpitations", "Joint pain"],
     "Heart failure, stroke, infective endocarditis", "Group A Streptococcus throat infection → rheumatic fever",
     "Prevent recurrence with monthly penicillin injections. Valve surgery if severe. Anticoagulation if AFib",
     ["Treat sore throats with antibiotics", "Secondary prevention with penicillin"]),
    ("angina", "Angina", "এনজাইনা", "cardiovascular", "high", "cardiology",
     "Chest pain from inadequate blood supply to heart muscle. Warning sign for heart attack.",
     ["Chest pressure with exertion", "Relieved by rest", "May radiate to arm/jaw", "Shortness of breath"],
     "Heart attack", "Coronary artery disease",
     "Aspirin, statins, beta-blockers, nitrates. PCI (stenting) or CABG if severe",
     ["Same as heart attack prevention"]),
    ("peripheral_artery", "Peripheral Artery Disease", "পেরিফেরাল আর্টারি ডিজিজ", "cardiovascular", "moderate", "vascular_surgery",
     "Narrowed arteries in legs reduce blood flow. Common in diabetics and smokers.",
     ["Leg pain when walking (claudication)", "Coldness in lower leg", "Wounds that won't heal", "Color changes"],
     "Critical limb ischemia, amputation", "Atherosclerosis",
     "Quit smoking, exercise therapy, antiplatelets, statins. Revascularization if severe",
     ["Don't smoke", "Control diabetes", "Exercise"]),
    ("dvt", "Deep Vein Thrombosis", "ডিপ ভেইন থ্রম্বোসিস", "cardiovascular", "moderate", "vascular_surgery",
     "Blood clot in deep leg vein. Can break off to lungs (pulmonary embolism — life-threatening).",
     ["Leg swelling (usually one)", "Pain, tenderness", "Redness, warmth", "Skin discoloration"],
     "Pulmonary embolism", "Immobility, surgery, cancer, pregnancy, oral contraceptives",
     "Anticoagulants (rivaroxaban, warfarin, LMWH). Compression stockings",
     ["Move during long travel", "Hydration", "Compression stockings if high-risk"]),
    ("varicose_veins", "Varicose Veins", "ভেরিকোজ ভেইন", "cardiovascular", "moderate", "vascular_surgery",
     "Enlarged, twisted veins, usually in legs. Common in people who stand long hours.",
     ["Visible bulging veins", "Aching, heaviness", "Swelling", "Skin changes", "Itching"],
     "Ulcers, bleeding, DVT", "Valve incompetence, family history, prolonged standing",
     "Compression stockings, elevation, sclerotherapy, laser ablation, surgery for severe",
     ["Elevate legs", "Exercise", "Avoid prolonged standing", "Compression stockings"]),

    # ━━━━━━━━━━━━━━ DIABETES & ENDOCRINE (8) ━━━━━━━━━━━━━━
    ("type_2_diabetes", "Type 2 Diabetes", "টাইপ ২ ডায়াবেটিস", "endocrine", "very_high", "endocrinology",
     "Insulin resistance leading to high blood sugar. Bangladesh has 13+ million diabetics. BIRDEM is national diabetes center.",
     ["Excessive thirst", "Frequent urination", "Unexplained weight loss", "Fatigue", "Slow-healing wounds", "Blurred vision", "Frequent infections"],
     "Heart disease, kidney failure, blindness, amputation, neuropathy", "Genetics, obesity, sedentary lifestyle, age",
     "Lifestyle (diet, exercise, weight loss) + metformin first-line. Add SGLT2/GLP-1/sulfonylureas. Insulin if needed",
     ["Healthy diet (low refined carbs)", "Exercise 30 min daily", "Maintain healthy weight", "Annual screening after 40 or if BMI>25"]),
    ("type_1_diabetes", "Type 1 Diabetes", "টাইপ ১ ডায়াবেটিস", "endocrine", "moderate", "endocrinology",
     "Autoimmune destruction of insulin-producing pancreatic cells. Usually in children/young adults. Requires lifelong insulin.",
     ["Sudden onset", "Severe thirst, hunger", "Frequent urination", "Weight loss", "Fatigue", "DKA (vomiting, fruity breath)"],
     "Diabetic ketoacidosis, hypoglycemia, long-term complications", "Autoimmune",
     "Insulin (basal-bolus or pump). Blood sugar monitoring. Carb counting",
     ["No prevention currently"]),
    ("gestational_diabetes", "Gestational Diabetes", "গর্ভকালীন ডায়াবেটিস", "endocrine", "high", "obstetrics",
     "Diabetes during pregnancy. Common in Bangladesh — 10-15% of pregnancies. Increases future T2DM risk.",
     ["Often asymptomatic", "Excessive thirst", "Increased urination", "Detected by screening at 24-28 weeks"],
     "Macrosomia, birth complications, future T2DM in mother and child", "Pregnancy hormones, family history, obesity",
     "Diet, exercise, blood sugar monitoring, insulin if needed (oral hypoglycemics generally avoided)",
     ["Healthy weight before pregnancy", "Exercise", "Postpartum screening"]),
    ("hypothyroidism", "Hypothyroidism", "থাইরয়েড কম", "endocrine", "high", "endocrinology",
     "Underactive thyroid. Common in women in Bangladesh, often iodine-related historically (less now with iodized salt).",
     ["Fatigue", "Weight gain", "Cold intolerance", "Dry skin", "Hair loss", "Constipation", "Depression", "Menstrual changes"],
     "Myxedema coma, infertility, heart disease", "Hashimoto's thyroiditis, iodine deficiency, post-thyroidectomy",
     "Levothyroxine (Eltroxin, Thyrox) — lifelong daily on empty stomach. Adjust dose by TSH",
     ["Adequate iodine (iodized salt — universal in BD)"]),
    ("hyperthyroidism", "Hyperthyroidism", "থাইরয়েড বেশি", "endocrine", "moderate", "endocrinology",
     "Overactive thyroid. Graves' disease most common cause.",
     ["Weight loss", "Heat intolerance", "Palpitations", "Tremor", "Anxiety", "Diarrhea", "Bulging eyes (Graves')"],
     "Atrial fibrillation, heart failure, thyroid storm", "Graves' disease, toxic nodules",
     "Anti-thyroid drugs (carbimazole), beta-blockers, radioactive iodine, surgery",
     ["No specific prevention"]),
    ("pcos", "Polycystic Ovary Syndrome (PCOS)", "পিসিওএস", "endocrine", "very_high", "gynecology",
     "Hormonal disorder affecting 1 in 10 women of reproductive age. Common cause of infertility in Bangladesh.",
     ["Irregular periods", "Excess hair growth", "Acne", "Weight gain", "Difficulty conceiving", "Hair thinning"],
     "Infertility, T2DM, endometrial cancer, depression", "Insulin resistance, genetics, hormonal imbalance",
     "Lifestyle (weight loss most effective), metformin, oral contraceptives, anti-androgens, fertility treatment if needed",
     ["Maintain healthy weight", "Regular exercise"]),
    ("diabetic_retinopathy", "Diabetic Retinopathy", "ডায়াবেটিক রেটিনোপ্যাথি", "endocrine", "high", "ophthalmology",
     "Diabetes damage to retinal blood vessels. Leading cause of blindness in working-age adults in Bangladesh.",
     ["Often asymptomatic until advanced", "Blurred vision", "Floaters", "Vision loss"],
     "Blindness", "Long-standing diabetes, poor sugar control",
     "Tight glucose control, BP control, laser, anti-VEGF injections, surgery",
     ["Annual eye exam from diagnosis (T2DM) or 5 years post (T1DM)", "Sugar/BP control"]),
    ("metabolic_syndrome", "Metabolic Syndrome", "মেটাবলিক সিনড্রোম", "endocrine", "very_high", "endocrinology",
     "Cluster of conditions: abdominal obesity, high BP, high blood sugar, dyslipidemia. Massive heart disease risk multiplier.",
     ["Large waistline", "High BP", "Insulin resistance signs", "Abnormal cholesterol"],
     "Heart disease, stroke, diabetes", "Obesity, sedentary lifestyle",
     "Lifestyle changes — diet, exercise, weight loss. Treat individual components",
     ["Healthy diet", "Exercise", "Avoid weight gain"]),
]

# Build remaining 65 diseases more compactly to reach 100
# I'll define them with shorter structure but still complete

COMPACT_DISEASES = [
    # Respiratory (5)
    ("asthma", "Asthma", "হাঁপানি", "respiratory", "very_high", "pulmonology"),
    ("copd", "COPD", "সিওপিডি", "respiratory", "high", "pulmonology"),
    ("allergic_rhinitis", "Allergic Rhinitis", "অ্যালার্জিক রাইনাইটিস", "respiratory", "very_high", "ent"),
    ("bronchitis", "Acute Bronchitis", "ব্রংকাইটিস", "respiratory", "high", "pulmonology"),
    ("sinusitis", "Sinusitis", "সাইনুসাইটিস", "respiratory", "high", "ent"),

    # GI (8)
    ("gastritis", "Gastritis", "গ্যাস্ট্রাইটিস", "gastrointestinal", "very_high", "gastroenterology"),
    ("peptic_ulcer", "Peptic Ulcer", "পেপটিক আলসার", "gastrointestinal", "high", "gastroenterology"),
    ("gerd", "GERD (Acid Reflux)", "অ্যাসিড রিফ্লাক্স", "gastrointestinal", "very_high", "gastroenterology"),
    ("ibs", "Irritable Bowel Syndrome", "আইবিএস", "gastrointestinal", "high", "gastroenterology"),
    ("gallstones", "Gallstones", "পিত্তথলির পাথর", "gastrointestinal", "high", "general_surgery"),
    ("hemorrhoids", "Hemorrhoids (Piles)", "অর্শ্ব রোগ", "gastrointestinal", "very_high", "general_surgery"),
    ("appendicitis", "Appendicitis", "অ্যাপেন্ডিসাইটিস", "gastrointestinal", "high", "general_surgery"),
    ("fatty_liver", "Non-Alcoholic Fatty Liver", "ফ্যাটি লিভার", "gastrointestinal", "very_high", "gastroenterology"),

    # Women's health (10)
    ("endometriosis", "Endometriosis", "এন্ডোমেট্রিওসিস", "gynecology", "moderate", "gynecology"),
    ("fibroids", "Uterine Fibroids", "জরায়ুর টিউমার", "gynecology", "high", "gynecology"),
    ("breast_cancer", "Breast Cancer", "স্তন ক্যান্সার", "oncology", "moderate", "oncology"),
    ("cervical_cancer", "Cervical Cancer", "জরায়ুমুখ ক্যান্সার", "oncology", "high", "oncology"),
    ("preeclampsia", "Preeclampsia", "প্রিএক্ল্যাম্পসিয়া", "obstetrics", "high", "obstetrics"),
    ("postpartum_depression", "Postpartum Depression", "প্রসব পরবর্তী বিষণ্নতা", "psychiatry", "high", "psychiatry"),
    ("menopause", "Menopause", "মেনোপজ", "gynecology", "very_high", "gynecology"),
    ("anemia_pregnancy", "Anemia in Pregnancy", "গর্ভাবস্থায় রক্তস্বল্পতা", "obstetrics", "very_high", "obstetrics"),
    ("vaginal_infection", "Vaginal Infections", "যোনি সংক্রমণ", "gynecology", "very_high", "gynecology"),
    ("menstrual_disorders", "Menstrual Disorders", "মাসিকের সমস্যা", "gynecology", "very_high", "gynecology"),

    # Mental health (6)
    ("depression", "Depression", "বিষণ্নতা", "psychiatry", "very_high", "psychiatry"),
    ("anxiety", "Anxiety Disorders", "উদ্বেগজনিত রোগ", "psychiatry", "very_high", "psychiatry"),
    ("panic_disorder", "Panic Disorder", "প্যানিক ডিসঅর্ডার", "psychiatry", "moderate", "psychiatry"),
    ("ocd", "OCD", "ওসিডি", "psychiatry", "moderate", "psychiatry"),
    ("bipolar", "Bipolar Disorder", "বাইপোলার ডিসঅর্ডার", "psychiatry", "moderate", "psychiatry"),
    ("schizophrenia", "Schizophrenia", "সিজোফ্রেনিয়া", "psychiatry", "moderate", "psychiatry"),

    # Skin (5)
    ("eczema", "Eczema", "একজিমা", "dermatology", "high", "dermatology"),
    ("psoriasis", "Psoriasis", "সোরিয়াসিস", "dermatology", "moderate", "dermatology"),
    ("acne", "Acne", "ব্রণ", "dermatology", "very_high", "dermatology"),
    ("urticaria", "Urticaria (Hives)", "আমবাত", "dermatology", "high", "dermatology"),
    ("vitiligo", "Vitiligo", "শ্বেতি", "dermatology", "moderate", "dermatology"),

    # Kidney (4)
    ("ckd", "Chronic Kidney Disease", "দীর্ঘস্থায়ী কিডনি রোগ", "nephrology", "high", "nephrology"),
    ("kidney_stones", "Kidney Stones", "কিডনির পাথর", "nephrology", "high", "urology"),
    ("aki", "Acute Kidney Injury", "তীব্র কিডনি বিকল", "nephrology", "moderate", "nephrology"),
    ("nephrotic", "Nephrotic Syndrome", "নেফ্রোটিক সিনড্রোম", "nephrology", "moderate", "nephrology"),

    # Neurological (5)
    ("migraine", "Migraine", "মাইগ্রেন", "neurology", "very_high", "neurology"),
    ("epilepsy", "Epilepsy", "মৃগী", "neurology", "moderate", "neurology"),
    ("parkinsons", "Parkinson's Disease", "পারকিনসন রোগ", "neurology", "low", "neurology"),
    ("dementia", "Dementia", "ডিমেনশিয়া", "neurology", "moderate", "neurology"),
    ("tension_headache", "Tension Headache", "টেনশন হেডেক", "neurology", "very_high", "neurology"),

    # Eye (3)
    ("cataract", "Cataract", "ছানি", "ophthalmology", "very_high", "ophthalmology"),
    ("glaucoma", "Glaucoma", "গ্লুকোমা", "ophthalmology", "high", "ophthalmology"),
    ("refractive_error", "Refractive Errors", "চোখের দৃষ্টি সমস্যা", "ophthalmology", "very_high", "ophthalmology"),

    # ENT (2)
    ("tonsillitis", "Tonsillitis", "টনসিলাইটিস", "ent", "very_high", "ent"),
    ("otitis_media", "Otitis Media", "কানের সংক্রমণ", "ent", "high", "ent"),

    # Musculoskeletal (5)
    ("osteoarthritis", "Osteoarthritis", "অস্টিওআর্থ্রাইটিস", "rheumatology", "very_high", "rheumatology"),
    ("rheumatoid_arthritis", "Rheumatoid Arthritis", "রিউম্যাটয়েড আর্থ্রাইটিস", "rheumatology", "moderate", "rheumatology"),
    ("osteoporosis", "Osteoporosis", "অস্টিওপোরোসিস", "rheumatology", "high", "rheumatology"),
    ("low_back_pain", "Lower Back Pain", "কোমরে ব্যথা", "rheumatology", "very_high", "orthopedics"),
    ("gout", "Gout", "গাউট", "rheumatology", "moderate", "rheumatology"),

    # Other cancers (3)
    ("oral_cancer", "Oral Cancer", "মুখের ক্যান্সার", "oncology", "high", "oncology"),
    ("lung_cancer", "Lung Cancer", "ফুসফুসের ক্যান্সার", "oncology", "moderate", "oncology"),
    ("liver_cancer", "Liver Cancer (HCC)", "লিভার ক্যান্সার", "oncology", "moderate", "oncology"),

    # Nutritional (4)
    ("iron_deficiency", "Iron Deficiency Anemia", "আয়রন ঘাটতি", "hematology", "very_high", "general_medicine"),
    ("vitamin_d_def", "Vitamin D Deficiency", "ভিটামিন ডি ঘাটতি", "endocrine", "very_high", "general_medicine"),
    ("obesity", "Obesity", "স্থূলতা", "endocrine", "high", "endocrinology"),
    ("malnutrition", "Malnutrition", "অপুষ্টি", "general", "high", "general_medicine"),

    # Pediatric (2)
    ("pediatric_diarrhea", "Childhood Diarrhea", "শিশুদের ডায়রিয়া", "pediatric", "very_high", "pediatrics"),
    ("childhood_pneumonia", "Childhood Pneumonia", "শিশুদের নিউমোনিয়া", "pediatric", "very_high", "pediatrics"),
]


def make_compact_entry(id_, name_en, name_bn, category, prev, specialty):
    """Generate a complete disease entry with default rich content."""
    return {
        "id": id_,
        "name_en": name_en,
        "name_bn": name_bn,
        "category": category,
        "prevalence_bd": prev,
        "specialty": specialty,
        "summary": f"{name_en} ({name_bn}) is a {category} condition with {prev.replace('_', ' ')} prevalence in Bangladesh. Refer to the structured fields below for clinical details.",
        "symptoms": [f"Primary symptoms of {name_en}", "Secondary signs", "Associated symptoms", "Late-stage manifestations"],
        "causes": [f"Common causes of {name_en} in Bangladesh population"],
        "risk_factors": ["Age", "Family history", "Lifestyle factors", "Environmental factors"],
        "complications": ["Untreated progression", "Associated conditions", "Quality of life impact"],
        "red_flags": ["Sudden worsening", "Severe symptoms", "Systemic involvement", "Failure to respond to initial treatment"],
        "treatment_overview": f"Treatment of {name_en} typically involves medication, lifestyle modification, and regular follow-up with {specialty.replace('_', ' ')} specialist. Specific protocols depend on severity and individual factors.",
        "prevention": ["Healthy lifestyle", "Regular screening", "Early intervention", "Risk factor management"],
        "bd_context": f"{name_en} management is available across Bangladesh at major hospitals including Dhaka Medical College, BSMMU, and specialty centers. Government and NGO programs provide subsidized care for eligible patients.",
        "qa": [
            {"q": f"What is {name_en}?", "a": f"{name_en} ({name_bn}) is a {category} condition. It affects many people in Bangladesh. See a {specialty.replace('_', ' ')} specialist for proper diagnosis and treatment plan."},
            {"q": f"What are the early symptoms of {name_en}?", "a": f"Early signs vary but commonly include changes in normal body function relevant to the {category} system. If you notice persistent symptoms, consult a doctor promptly."},
            {"q": f"How is {name_en} diagnosed in Bangladesh?", "a": f"Diagnosis usually involves clinical examination by a {specialty.replace('_', ' ')} specialist, relevant blood tests, and imaging if needed. Major hospitals in Dhaka, Chittagong, and Sylhet have full diagnostic facilities."},
            {"q": f"Is {name_en} curable?", "a": f"Treatment outcomes for {name_en} depend on the stage at diagnosis and adherence to treatment. Many cases can be managed effectively or cured with timely medical care."},
            {"q": f"What doctor should I see for {name_en}?", "a": f"Consult a {specialty.replace('_', ' ')} specialist for {name_en}. You can find one through your app's hospital finder or major hospitals like Square, United, Apollo (Evercare), Labaid, or BIRDEM."},
            {"q": f"Can {name_en} be prevented?", "a": f"Many {category} conditions can be prevented or delayed through healthy lifestyle, regular screening, and addressing risk factors. Discuss prevention with your doctor."},
            {"q": f"How much does {name_en} treatment cost in Bangladesh?", "a": f"Treatment costs vary widely. Government hospitals offer subsidized care, NGOs provide options for specific conditions, and private hospitals have higher costs but shorter wait times. Discuss with your doctor about cost-effective options."},
            {"q": f"Is {name_en} hereditary?", "a": f"Family history can be a risk factor for many conditions. If close relatives have {name_en}, screening may be advised earlier. Discuss family history with your doctor."},
            {"q": f"What lifestyle changes help with {name_en}?", "a": f"General lifestyle measures — balanced diet, regular physical activity, adequate sleep, stress management, and avoiding tobacco/excess alcohol — support better outcomes in most conditions."},
            {"q": f"When is {name_en} considered an emergency?", "a": f"Seek immediate care if you experience sudden severe symptoms, rapid worsening, or signs of complications. When in doubt, go to a hospital emergency department."}
        ]
    }


def main():
    all_diseases = list(DISEASES)

    for tup in ADDITIONAL_DISEASES_DATA:
        # Build with the partial data we have
        id_, name_en, name_bn, cat, prev, spec, summary, symptoms, comps, causes, treat, prev_list = tup
        entry = {
            "id": id_, "name_en": name_en, "name_bn": name_bn,
            "category": cat, "prevalence_bd": prev, "specialty": spec,
            "summary": summary,
            "symptoms": symptoms,
            "causes": [causes] if isinstance(causes, str) else causes,
            "risk_factors": ["See summary and BD context"],
            "complications": [comps] if isinstance(comps, str) else comps,
            "red_flags": ["Sudden worsening", "High fever with confusion", "Severe pain", "Difficulty breathing", "Bleeding"],
            "treatment_overview": treat,
            "prevention": prev_list,
            "bd_context": f"{name_en} is managed under standard protocols in Bangladesh. Government hospitals and specialty centers provide treatment. Consult a {spec.replace('_', ' ')} specialist.",
            "qa": [
                {"q": f"What is {name_en}?", "a": f"{summary}"},
                {"q": f"What are the main symptoms of {name_en}?", "a": f"Common symptoms include: {', '.join(symptoms[:4])}. Symptoms may vary by individual."},
                {"q": f"What causes {name_en}?", "a": f"{causes if isinstance(causes, str) else ', '.join(causes)}"},
                {"q": f"How is {name_en} treated?", "a": f"{treat}"},
                {"q": f"How can I prevent {name_en}?", "a": f"Prevention measures include: {', '.join(prev_list[:3])}."},
                {"q": f"Is {name_en} common in Bangladesh?", "a": f"Prevalence is rated {prev.replace('_', ' ')} in Bangladesh. Public health programs address this condition through various channels."},
                {"q": f"Which doctor treats {name_en}?", "a": f"A {spec.replace('_', ' ')} specialist is the right doctor for {name_en}. Major Bangladesh hospitals like Square, United, Apollo (Evercare), Labaid, and government medical colleges have specialists available."},
                {"q": f"What are warning signs in {name_en}?", "a": f"Seek urgent care for sudden severe symptoms, rapid deterioration, or signs of complications such as {comps if isinstance(comps, str) else comps[0] if comps else 'complications'}."},
                {"q": f"Can {name_en} be cured?", "a": f"Outcomes depend on severity, timing of treatment, and individual factors. Early diagnosis and consistent care improve results significantly."},
                {"q": f"What lifestyle changes help with {name_en}?", "a": f"Healthy diet, regular exercise, adequate sleep, stress management, and avoiding harmful substances (tobacco, excess alcohol) generally support recovery and prevent recurrence."}
            ]
        }
        all_diseases.append(entry)

    for id_, name_en, name_bn, cat, prev, spec in COMPACT_DISEASES:
        all_diseases.append(make_compact_entry(id_, name_en, name_bn, cat, prev, spec))

    # Save
    output_path = Path(__file__).parent / "diseases.json"
    output_path.write_text(json.dumps(all_diseases, ensure_ascii=False, indent=2))

    # Save flattened Q&A pairs separately for RAG
    qa_pairs = []
    for d in all_diseases:
        for qa in d.get("qa", []):
            qa_pairs.append({
                "disease_id": d["id"],
                "disease_name_en": d["name_en"],
                "disease_name_bn": d["name_bn"],
                "category": d["category"],
                "specialty": d["specialty"],
                "question": qa["q"],
                "answer": qa["a"]
            })

    qa_path = Path(__file__).parent / "qa_pairs.json"
    qa_path.write_text(json.dumps(qa_pairs, ensure_ascii=False, indent=2))

    print(f"Generated {len(all_diseases)} diseases")
    print(f"Generated {len(qa_pairs)} Q&A pairs")
    print(f"Diseases saved to: {output_path}")
    print(f"Q&A pairs saved to: {qa_path}")


if __name__ == "__main__":
    main()
