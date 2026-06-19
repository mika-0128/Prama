const effectsData = {
  "irregular-periods":{
    title:"Irregular Periods",
    category:"Cycle",
    icon:"fa-calendar-days",
    what:"Irregular periods mean your cycle may be delayed, skipped, very long, very short, or unpredictable.",
    why:"In PCOS/PMOS, hormone imbalance and irregular ovulation can affect when the uterine lining sheds.",
    manage:"Tracking your cycle, improving sleep, balanced meals, regular movement, and medical guidance can help manage irregularity.",
    doctor:"See a doctor if periods stop for months, bleeding is very heavy, pain is severe, or cycles suddenly change."
  },

  "acne-oily-skin":{
    title:"Acne & Oily Skin",
    category:"Skin",
    icon:"fa-face-smile",
    what:"Acne and oily skin may happen due to increased oil production and hormonal changes.",
    why:"Higher androgen levels can increase sebum production, which may clog pores and trigger acne.",
    manage:"Use gentle skincare, avoid harsh scrubbing, maintain consistent routines, and consult a dermatologist if acne is persistent.",
    doctor:"See a doctor if acne is painful, leaves scars, or does not improve with basic skincare."
  },

  "hair-fall":{
    title:"Hair Fall & Thinning",
    category:"Hair",
    icon:"fa-scissors",
    what:"Hair fall or thinning may appear as increased shedding or reduced hair volume.",
    why:"Hormonal imbalance, stress, low nutrients, thyroid issues, or androgen sensitivity may contribute.",
    manage:"Check nutrition, manage stress, avoid tight hairstyles, and seek medical evaluation for persistent hair fall.",
    doctor:"See a doctor if hair loss is sudden, patchy, severe, or worsening."
  },

  "weight-gain":{
    title:"Weight Gain & Difficulty Losing Weight",
    category:"Metabolic",
    icon:"fa-weight-scale",
    what:"Your body's weight or shape may naturally fluctuate or settle at a higher point as your metabolism and hormones adjust to PCOS/PMOS.",
    why:"Insulin resistance, hormonal shifts, and stress can change how your body processes and stores energy. This is a common and highly natural bodily response, not a personal failure.",
    manage:"Focus on how your body feels rather than the number on the scale. Prioritize sleep, stress reduction, and gentle self-care.",
    doctor:"See a doctor if changes happen very rapidly or if you feel unwell or heavily fatigued.",
    showPlan:true,
    food: "Focus on adding to your plate, not restricting! Incorporate colorful, fiber-rich vegetables, complex carbs (like sweet potatoes or oats) to keep blood sugar stable, and lean proteins to support your energy. Remember, there are no 'bad' foods—just focus on what makes your body feel energized, satisfied, and strong.",
    movement: "Movement should be a celebration of what your amazing body can do, not a punishment. Gentle, low-impact exercises like Mat Pilates and restorative Yoga are incredible for lowering cortisol (stress) and supporting insulin sensitivity. Walking in nature, dancing in your room, or swimming are also fantastic ways to feel good without overtaxing your nervous system."
  },

  "excess-hair-growth":{
    title:"Excess Hair Growth",
    category:"Hair",
    icon:"fa-user",
    what:"Excess hair growth can appear on the face, chin, chest, or body.",
    why:"Higher androgen levels can stimulate thicker or darker hair growth in certain areas.",
    manage:"Medical evaluation, hair removal options, skincare support, and hormone management may help.",
    doctor:"See a doctor if hair growth is sudden, severe, or comes with other hormone symptoms."
  },

  "mood-swings":{
    title:"Mood Swings & Anxiety",
    category:"Mood",
    icon:"fa-brain",
    what:"Mood swings may include irritability, anxiety, sadness, emotional ups and downs, or low motivation.",
    why:"Hormone fluctuations, stress, sleep issues, blood sugar changes, and chronic symptoms may influence mood.",
    manage:"Mood tracking, sleep hygiene, movement, calming routines, and professional support can help.",
    doctor:"Seek help if mood symptoms affect daily life, relationships, sleep, or school/work."
  },

  "fatigue":{
    title:"Fatigue & Low Energy",
    category:"Metabolic",
    icon:"fa-battery-quarter",
    what:"Fatigue means feeling tired, low-energy, or drained even after rest.",
    why:"Insulin resistance, poor sleep, stress, low nutrients, thyroid issues, or heavy bleeding may contribute.",
    manage:"Track sleep, meals, activity, hydration, and symptoms. Consider medical checks if fatigue persists.",
    doctor:"See a doctor if fatigue is severe, sudden, or affecting daily life."
  },

  "fertility-concerns":{
    title:"Fertility Concerns",
    category:"Cycle",
    icon:"fa-heart",
    what:"Fertility concerns may happen when ovulation is irregular or unpredictable.",
    why:"PCOS/PMOS can affect ovulation timing, making it harder to predict fertile days.",
    manage:"Cycle tracking, medical guidance, lifestyle support, and ovulation monitoring may help.",
    doctor:"See a doctor if you are trying to conceive and cycles are irregular or absent."
  }
};

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const data = effectsData[id] || effectsData["irregular-periods"];

document.getElementById("effectTitle").textContent = data.title;
document.getElementById("effectCategory").textContent = data.category;
document.getElementById("whatText").textContent = data.what;
document.getElementById("whyText").textContent = data.why;
document.getElementById("manageText").textContent = data.manage;
document.getElementById("doctorText").textContent = data.doctor;

document.getElementById("detailIcon").innerHTML =
`<i class="fa-solid ${data.icon}"></i>`;

const planCard = document.getElementById("planCard");

if(!data.showPlan){
  planCard.style.display = "none";
}