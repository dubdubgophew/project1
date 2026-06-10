'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { ToolSEOContent } from '@/components/tools/ToolSEOContent';
import { ToolFAQ } from '@/components/tools/ToolFAQ';

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const PROGRAM = [
  {day:1,phase:1,name:"ZERO HOUR",rest:false,ex:[
    {nm:"Plank Hold",r:3,u:"×20 sec",d:"Perfect form. Feel it."},
    {nm:"Hollow Body",r:3,u:"×15 sec",d:"Lower back FLAT"},
    {nm:"Leg Raises",r:2,u:"×8 reps",d:"Slow descent, 3 sec"}
  ]},
  {day:2,phase:1,name:"REST",rest:true},
  {day:3,phase:1,name:"FIRST BLOOD",rest:false,ex:[
    {nm:"Plank Hold",r:3,u:"×25 sec"},{nm:"Hollow Body",r:3,u:"×20 sec"},{nm:"Leg Raises",r:2,u:"×10 reps",d:"Control descent"},{nm:"Dead Bug",r:2,u:"×8 reps",d:"Arm + opp. leg"}
  ]},
  {day:4,phase:1,name:"HOLD THE LINE",rest:false,ex:[
    {nm:"Plank Hold",r:4,u:"×25 sec"},{nm:"Hollow Body",r:3,u:"×20 sec"},{nm:"Bicycle Crunches",r:2,u:"×12 reps",d:"Slow rotation"},{nm:"Leg Raises",r:3,u:"×10 reps"}
  ]},
  {day:5,phase:1,name:"REST",rest:true},
  {day:6,phase:1,name:"FULL ASSAULT",rest:false,ex:[
    {nm:"Plank Hold",r:4,u:"×30 sec"},{nm:"Hollow Body",r:4,u:"×20 sec"},{nm:"Leg Raises",r:3,u:"×12 reps"},{nm:"Bicycle Crunches",r:3,u:"×15 reps"}
  ]},
  {day:7,phase:1,name:"MOUNTAIN CLIMB",rest:false,ex:[
    {nm:"Plank Hold",r:4,u:"×30 sec"},{nm:"Mountain Climbers",r:3,u:"×20 reps",d:"NEW"},{nm:"Hollow Body",r:4,u:"×25 sec"},{nm:"Leg Raises",r:3,u:"×12 reps"}
  ]},
  {day:8,phase:1,name:"REST",rest:true},
  {day:9,phase:1,name:"GRIT CHECK",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×30 sec"},{nm:"Mountain Climbers",r:3,u:"×25 reps"},{nm:"Bicycle Crunches",r:3,u:"×20 reps"},{nm:"Leg Raises",r:3,u:"×15 reps"},{nm:"Hollow Body",r:3,u:"×25 sec"}
  ]},
  {day:10,phase:1,name:"PHASE 1 TEST",rest:false,ex:[
    {nm:"Plank Hold",r:1,u:"×MAX",d:"Note your time"},{nm:"Leg Raises",r:3,u:"×15 reps"},{nm:"Mountain Climbers",r:3,u:"×30 reps"},{nm:"Bicycle Crunches",r:3,u:"×20 reps"},{nm:"Hollow Body",r:1,u:"×MAX"}
  ]},
  {day:11,phase:2,name:"PHASE 2 INIT",rest:false,ex:[
    {nm:"Plank Hold",r:4,u:"×40 sec"},{nm:"Side Plank L",r:3,u:"×20 sec",d:"NEW"},{nm:"Side Plank R",r:3,u:"×20 sec"},{nm:"Leg Raises",r:4,u:"×15 reps"},{nm:"Flutter Kicks",r:3,u:"×20 reps",d:"NEW"}
  ]},
  {day:12,phase:2,name:"REST",rest:true},
  {day:13,phase:2,name:"COMPOUND FIRE",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×40 sec"},{nm:"Flutter Kicks",r:4,u:"×25 reps"},{nm:"Bicycle Crunches",r:4,u:"×20 reps"},{nm:"Side Plank L",r:3,u:"×25 sec"},{nm:"Side Plank R",r:3,u:"×25 sec"}
  ]},
  {day:14,phase:2,name:"PUSH HARDER",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×45 sec"},{nm:"Mountain Climbers",r:4,u:"×30 reps"},{nm:"Leg Raises",r:4,u:"×18 reps"},{nm:"Flutter Kicks",r:4,u:"×30 reps"}
  ]},
  {day:15,phase:2,name:"REST",rest:true},
  {day:16,phase:2,name:"HALFWAY",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×50 sec"},{nm:"V-Sit Hold",r:3,u:"×15 sec",d:"NEW"},{nm:"Bicycle Crunches",r:4,u:"×25 reps"},{nm:"Flutter Kicks",r:4,u:"×30 reps"},{nm:"Side Plank L+R",r:3,u:"×30 sec ea"}
  ]},
  {day:17,phase:2,name:"NIGHT OPS",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×50 sec"},{nm:"V-Sit Hold",r:4,u:"×20 sec"},{nm:"Mountain Climbers",r:4,u:"×35 reps"},{nm:"Leg Raises",r:4,u:"×20 reps"}
  ]},
  {day:18,phase:2,name:"REST",rest:true},
  {day:19,phase:2,name:"HIGH VOLUME",rest:false,ex:[
    {nm:"Plank Hold",r:6,u:"×45 sec"},{nm:"V-Sit Hold",r:4,u:"×20 sec"},{nm:"Bicycle Crunches",r:5,u:"×25 reps"},{nm:"Flutter Kicks",r:5,u:"×35 reps"},{nm:"Side Plank L+R",r:4,u:"×30 sec ea"}
  ]},
  {day:20,phase:2,name:"PHASE 2 TEST",rest:false,ex:[
    {nm:"Plank Hold",r:1,u:"×MAX",d:"Beat Day 10"},{nm:"V-Sit Hold",r:3,u:"×25 sec"},{nm:"Mountain Climbers",r:4,u:"×40 reps"},{nm:"Bicycle Crunches",r:4,u:"×30 reps"},{nm:"Flutter Kicks",r:4,u:"×40 reps"}
  ]},
  {day:21,phase:3,name:"IRON BEGINS",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×60 sec"},{nm:"Side Plank L+R",r:4,u:"×35 sec ea"},{nm:"V-Sit Hold",r:4,u:"×25 sec"},{nm:"Leg Raises",r:5,u:"×20 reps"},{nm:"Flutter Kicks",r:5,u:"×40 reps"}
  ]},
  {day:22,phase:3,name:"REST",rest:true},
  {day:23,phase:3,name:"FULL METAL",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×60 sec"},{nm:"Bicycle Crunches",r:5,u:"×35 reps"},{nm:"Mountain Climbers",r:5,u:"×40 reps"},{nm:"V-Sit Hold",r:4,u:"×30 sec"},{nm:"Flutter Kicks",r:5,u:"×45 reps"}
  ]},
  {day:24,phase:3,name:"PAIN IS INFO",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×70 sec"},{nm:"Side Plank L+R",r:4,u:"×40 sec ea"},{nm:"Leg Raises",r:5,u:"×22 reps"},{nm:"Bicycle Crunches",r:5,u:"×35 reps"}
  ]},
  {day:25,phase:3,name:"REST",rest:true},
  {day:26,phase:3,name:"DEEP STRIKE",rest:false,ex:[
    {nm:"Plank Hold",r:6,u:"×60 sec"},{nm:"V-Sit Hold",r:5,u:"×30 sec"},{nm:"Mountain Climbers",r:5,u:"×45 reps"},{nm:"Flutter Kicks",r:5,u:"×50 reps"},{nm:"Side Plank L+R",r:4,u:"×40 sec ea"}
  ]},
  {day:27,phase:3,name:"FINAL PUSH",rest:false,ex:[
    {nm:"Plank Hold",r:6,u:"×70 sec"},{nm:"Bicycle Crunches",r:6,u:"×35 reps"},{nm:"Leg Raises",r:5,u:"×25 reps"},{nm:"Flutter Kicks",r:6,u:"×50 reps"},{nm:"V-Sit Hold",r:5,u:"×30 sec"}
  ]},
  {day:28,phase:3,name:"REST",rest:true},
  {day:29,phase:3,name:"PENULTIMATE",rest:false,ex:[
    {nm:"Plank Hold",r:5,u:"×80 sec"},{nm:"Side Plank L+R",r:5,u:"×45 sec ea"},{nm:"Mountain Climbers",r:5,u:"×50 reps"},{nm:"Bicycle Crunches",r:6,u:"×40 reps"},{nm:"Flutter Kicks",r:6,u:"×50 reps"}
  ]},
  {day:30,phase:3,name:"GRADUATION",rest:false,ex:[
    {nm:"Plank Hold",r:1,u:"×MAX",d:"Personal record"},{nm:"Side Plank L+R",r:3,u:"×MAX"},{nm:"V-Sit Hold",r:3,u:"×MAX"},{nm:"Bicycle Crunches",r:5,u:"×50 reps"},{nm:"Flutter Kicks",r:5,u:"×60 reps"},{nm:"Mountain Climbers",r:5,u:"×50 reps"},{nm:"Leg Raises",r:5,u:"×25 reps"}
  ]},
] as const;

const EX_CUES: Record<string, {t:string;w:boolean}[]> = {
  "Plank Hold": [
    {t:"Elbows directly under shoulders",w:false},
    {t:"<strong>Squeeze</strong> core, glutes, quads simultaneously",w:false},
    {t:"Breathe slowly through nose — do NOT hold breath",w:false},
    {t:"⚠ FAULT: Hips sagging or raised",w:true}
  ],
  "Hollow Body": [
    {t:"Press <strong>lower back INTO floor</strong> — non-negotiable",w:false},
    {t:"Raise legs to 45°, shoulders 2 inches off floor",w:false},
    {t:"Arms overhead, ribs down",w:false},
    {t:"⚠ FAULT: Lower back lifting off floor",w:true}
  ],
  "Leg Raises": [
    {t:"Hands <strong>tucked under lower back</strong> for support",w:false},
    {t:"Raise both legs to 90° (UP)",w:false},
    {t:"Lower <strong>SLOWLY — 3 full seconds</strong> down",w:false},
    {t:"⚠ FAULT: Dropping legs fast / using momentum",w:true}
  ],
  "Dead Bug": [
    {t:"Back flat on floor throughout",w:false},
    {t:"Extend <strong>RIGHT arm + LEFT leg</strong> simultaneously",w:false},
    {t:"Return slowly. Switch sides. Each pair = 1 rep",w:false},
    {t:"⚠ FAULT: Lower back arching as limbs extend",w:true}
  ],
  "Bicycle Crunches": [
    {t:"Hands <strong>lightly</strong> behind head — elbows wide",w:false},
    {t:"<strong>Full rotation</strong> of torso, elbow to opposite knee",w:false},
    {t:"Extend the other leg LOW. Slow = better.",w:false},
    {t:"⚠ FAULT: Rushing / pulling neck with hands",w:true}
  ],
  "Mountain Climbers": [
    {t:"Push-up position, arms locked straight",w:false},
    {t:"Drive knee <strong>explosively</strong> to chest",w:false},
    {t:"Hips stay <strong>level</strong> — no rocking",w:false},
    {t:"⚠ FAULT: Raising hips to cheat the movement",w:true}
  ],
  "Flutter Kicks": [
    {t:"Hands <strong>under butt</strong>. Legs at 45°",w:false},
    {t:"Small, rapid alternating kicks — legs STRAIGHT",w:false},
    {t:"Count military: 1-2-3-ONE, 1-2-3-TWO",w:false},
    {t:"⚠ FAULT: Bending knees / legs dropping below 20°",w:true}
  ],
  "Side Plank L": [
    {t:"Lie on <strong>left side</strong>. Elbow under shoulder.",w:false},
    {t:"Lift hips off floor — body forms straight diagonal",w:false},
    {t:"Free arm up or on hip. Breathe.",w:false},
    {t:"⚠ FAULT: Hips sagging or rotating forward",w:true}
  ],
  "Side Plank R": [
    {t:"Lie on <strong>right side</strong>. Elbow under shoulder.",w:false},
    {t:"Lift hips off floor — body forms straight diagonal",w:false},
    {t:"Free arm up or on hip. Breathe.",w:false},
    {t:"⚠ FAULT: Hips sagging or rotating forward",w:true}
  ],
  "Side Plank L+R": [
    {t:"Do <strong>both sides equally</strong>. No cheating one side.",w:false},
    {t:"Elbow directly under shoulder. Hips lifted.",w:false},
    {t:"Body forms a perfect diagonal line",w:false},
    {t:"⚠ FAULT: Torso rotating, hips dropping",w:true}
  ],
  "V-Sit Hold": [
    {t:"Lean torso back <strong>45°</strong> — only sit bones on floor",w:false},
    {t:"Raise both legs to <strong>45°</strong> — form a V",w:false},
    {t:"Arms reach forward or cross chest",w:false},
    {t:"⚠ FAULT: Rounding back / hands on floor behind you",w:true}
  ],
};

const QUOTES = [
  {t:"The pain you feel today will be the strength you feel tomorrow.",a:"Arnold Schwarzenegger",fire:true},
  {t:"Do not pray for an easy life, pray for the strength to endure a difficult one.",a:"Bruce Lee",fire:true},
  {t:"Discipline is the bridge between goals and accomplishment.",a:"Jim Rohn",fire:false},
  {t:"The body achieves what the mind believes.",a:"Unknown",fire:true},
  {t:"Strength does not come from physical capacity. It comes from an indomitable will.",a:"Mahatma Gandhi",fire:false},
  {t:"We must all suffer one of two things: the pain of discipline or the pain of regret.",a:"Jim Rohn",fire:true},
  {t:"Blood, sweat and respect. First two you give, last one you earn.",a:"Dwayne Johnson",fire:true},
  {t:"The difference between the impossible and the possible lies in a person's determination.",a:"Tommy Lasorda",fire:false},
  {t:"Champions aren't made in gyms. Champions are made from something they have deep inside them.",a:"Muhammad Ali",fire:true},
  {t:"One who conquers the sea today is ready to conquer the ocean tomorrow.",a:"Unknown",fire:false},
  {t:"Physical fitness is not only one of the most important keys to a healthy body, it is the basis of dynamic and creative intellectual activity.",a:"John F. Kennedy",fire:false},
  {t:"The successful warrior is the average man, with laser-like focus.",a:"Bruce Lee",fire:true},
  {t:"You have to push past your perceived limits, push past that point you thought was as far as you can go.",a:"Drew Brees",fire:true},
  {t:"Fitness is not about being better than someone else. It is about being better than you used to be.",a:"Unknown",fire:false},
  {t:"Today I will do what others won't, so tomorrow I can accomplish what others can't.",a:"Jerry Rice",fire:true},
  {t:"The only bad workout is the one that didn't happen.",a:"Unknown",fire:false},
];

const DONT_LIST = [
  {t:"Skip warm-up or cool-down",d:"Cold muscles tear. 5 min matters."},
  {t:"Train through sharp pain",d:"Discomfort = growth. Pain = injury. Know the difference."},
  {t:"Rush the reps",d:"Slow controlled movement recruits more fibers. Fast = momentum, not muscle."},
  {t:"Skip rest days",d:"Muscle is built during recovery, not during training."},
  {t:"Eat processed food before training",d:"You need clean fuel — complex carbs, not sugar spikes."},
  {t:"Hydrate only when thirsty",d:"By the time you're thirsty, you're already 2% dehydrated."},
  {t:"Compare day 1 to someone's day 1000",d:"Your only competition is yesterday's you."},
  {t:"Neglect sleep",d:"Growth hormone peaks during deep sleep. 7-8 hours minimum."},
  {t:"Hold your breath during holds",d:"Oxygen deprivation limits performance and causes dizziness."},
  {t:"Quit when it burns",d:"The burn is lactic acid — it means you're growing. Breathe through it."},
];

const MORNING_HABITS = [
  {icon:"🌅",t:"5 AM Wake",d:"Rise with military precision. No snooze. Phone face-down for 30 min."},
  {icon:"💧",t:"Cold Water First",d:"500ml water immediately. Cold if possible. Jumpstarts metabolism."},
  {icon:"🫁",t:"Pranayama",d:"10 min box breathing: 4-4-4-4. Activates parasympathetic system."},
  {icon:"🧘",t:"Sun Salutation",d:"12 rounds Surya Namaskar. Warms body, aligns spine."},
  {icon:"📖",t:"Read 20 Min",d:"Non-fiction. Philosophy, science, strategy. Feed the mind before feeding the body."},
  {icon:"🏋️",t:"Workout",d:"Complete today's mission. No negotiations."},
  {icon:"🥣",t:"Breakfast",d:"Eat within 1 hour of waking. High protein, complex carbs."},
];

const EVENING_HABITS = [
  {icon:"🌙",t:"Digital Sunset",d:"No screens after 9 PM. Blue light destroys melatonin production."},
  {icon:"📝",t:"Journal 5 Min",d:"3 wins today. 1 lesson learned. Tomorrow's top priority."},
  {icon:"🧘",t:"Yoga Nidra",d:"20 min guided relaxation. Reduces cortisol by 40%."},
  {icon:"📚",t:"Read Physical Book",d:"Not a screen. 20 pages minimum."},
  {icon:"🛁",t:"Cold Shower",d:"Ends with 2 min cold. Accelerates recovery, improves sleep quality."},
  {icon:"😴",t:"10 PM Sleep",d:"Non-negotiable. Sleep debt cannot be repaid with weekend binges."},
];

const DAILY_LAWS = [
  {t:"No Junk in, No Junk out",d:"Every input shapes your output. Guard your attention, food, and information diet."},
  {t:"One hard thing daily",d:"Do the thing you are avoiding. Resistance is the compass pointing to growth."},
  {t:"Measure everything",d:"What gets measured gets managed. Log your food, workouts, sleep."},
  {t:"Silence is a weapon",d:"Practice 10 minutes of complete silence daily. Most people never do this."},
];

const ANCIENT_TECHS = [
  {t:"Trataka (Vedic)",tag:"Vedic",d:"Fix gaze on a candle flame for 10 minutes without blinking. Builds laser focus and willpower. Used by ancient warriors before battle."},
  {t:"Vipassana (Buddhist)",tag:"Buddhist",d:"10 minutes of breath observation. No control, just witnessing. Rewires neural pathways. 2500-year-old technology."},
  {t:"Zazen (Zen)",tag:"Zen",d:"Sit in stillness, facing wall, 20 minutes. No thoughts, no movement. Warrior monks used this before combat."},
  {t:"Ikigai (Japanese)",tag:"Japanese",d:"Find your reason to wake up. Write: What you love + What you're good at + What world needs + What pays you. Their intersection is your ikigai."},
  {t:"Stoic Morning Review (Roman)",tag:"Stoic",d:"Marcus Aurelius: 'What will I fail at today? What will I endure?' Premeditatio Malorum — mentally rehearse challenges before they arrive."},
  {t:"Wim Hof Breathing",tag:"Modern",d:"30 deep breaths, exhale, hold. Repeat 3 cycles. Activates immune system, alkalizes blood. Proven by science."},
  {t:"Cold Exposure Protocol",tag:"Modern",d:"2 min cold shower ends every session. Triggers norepinephrine +300%, dopamine +250%. Not comfort — adaptation."},
  {t:"Mantra Repetition (Vedic)",tag:"Vedic",d:"'So Hum' (I am that) — 108 repetitions using mala beads. Syncs breath to identity. Used by Indian military ascetics."},
  {t:"Intermittent Fasting (Ancient)",tag:"Universal",d:"16:8 window. Eat between 12-8pm. Ancient warriors didn't eat before battle. Fasting sharpens the mind."},
  {t:"Gratitude Prostrations",tag:"Buddhist",d:"3 full-body bows upon waking. Physical humility before the day. Resets ego. Tibetan monks start every day this way."},
  {t:"Journaling (Stoic/Vedic)",tag:"Stoic",d:"5 min AM: intentions. 5 min PM: reflection. Marcus Aurelius wrote Meditations as private journal. It changed civilization."},
  {t:"Forest Bathing (Shinrin-yoku)",tag:"Japanese",d:"20 min walk in nature, no phone. Inhaling phytoncides from trees reduces cortisol by 15%. Military recovery protocol."},
];

const DIET_WEEKS = [
  {
    week:1,label:"Foundation",
    days:[
      {d:"Mon",meals:[
        {time:"7 AM",meal:"Oats with banana + almonds",cal:350,desc:"Steel cut oats preferred"},
        {time:"10 AM",meal:"Sprouts chaat with lemon",cal:180,desc:"Moong or mixed sprouts"},
        {time:"1 PM",meal:"Dal khichdi + curd",cal:420,desc:"Moong dal, brown rice"},
        {time:"4 PM",meal:"Roasted chana + green tea",cal:160,desc:"No sugar"},
        {time:"7 PM",meal:"Palak paneer + roti (2)",cal:480,desc:"Whole wheat roti"},
      ]},
      {d:"Tue",meals:[
        {time:"7 AM",meal:"Poha with peanuts",cal:320,desc:"Light start"},
        {time:"10 AM",meal:"Fruit bowl (apple, papaya)",cal:150,desc:"No mango"},
        {time:"1 PM",meal:"Rajma + brown rice + salad",cal:460,desc:"High protein"},
        {time:"4 PM",meal:"Peanut butter on rye toast",cal:210,desc:"2 tbsp PB"},
        {time:"7 PM",meal:"Vegetable soup + 2 eggs",cal:380,desc:"Or tofu for veg"},
      ]},
      {d:"Wed",meals:[
        {time:"7 AM",meal:"Idli (4) + sambar",cal:340,desc:"Fermented = probiotics"},
        {time:"10 AM",meal:"Curd with seeds",cal:170,desc:"Flax + chia"},
        {time:"1 PM",meal:"Chickpea curry + quinoa",cal:450,desc:"High protein combo"},
        {time:"4 PM",meal:"Handful of walnuts",cal:185,desc:"Brain food"},
        {time:"7 PM",meal:"Stir-fried tofu + veggies",cal:390,desc:"Minimal oil"},
      ]},
      {d:"Thu",meals:[
        {time:"7 AM",meal:"Smoothie: banana+spinach+milk",cal:310,desc:"No added sugar"},
        {time:"10 AM",meal:"Hard boiled eggs (2)",cal:155,desc:"Or paneer cubes"},
        {time:"1 PM",meal:"Lentil soup + multigrain roti",cal:440,desc:"Toor dal"},
        {time:"4 PM",meal:"Roasted makhana",cal:120,desc:"Fox nuts, low cal"},
        {time:"7 PM",meal:"Vegetable biryani + raita",cal:470,desc:"Light portion"},
      ]},
      {d:"Fri",meals:[
        {time:"7 AM",meal:"Dosa (2) + coconut chutney",cal:360,desc:"Fermented"},
        {time:"10 AM",meal:"Apple + peanut butter",cal:200,desc:"Energy sustaining"},
        {time:"1 PM",meal:"Mixed dal + brown rice",cal:430,desc:"Protein rich"},
        {time:"4 PM",meal:"Green tea + almonds (10)",cal:130,desc:"Catechins + fat"},
        {time:"7 PM",meal:"Paneer bhurji + roti (2)",cal:490,desc:"High protein dinner"},
      ]},
      {d:"Sat",meals:[
        {time:"8 AM",meal:"Upma with vegetables",cal:280,desc:"Semolina based"},
        {time:"11 AM",meal:"Banana + milk",cal:220,desc:"Post workout friendly"},
        {time:"1 PM",meal:"Chole + roti (2) + salad",cal:510,desc:"High fiber"},
        {time:"4 PM",meal:"Coconut water",cal:46,desc:"Natural electrolytes"},
        {time:"7 PM",meal:"Moong dal chilla + curd",cal:360,desc:"High protein, light"},
      ]},
      {d:"Sun",meals:[
        {time:"8 AM",meal:"Parathas (2) + curd",cal:420,desc:"Whole wheat, light oil"},
        {time:"11 AM",meal:"Seasonal fruit",cal:120,desc:"Whatever's available"},
        {time:"2 PM",meal:"Full thali: dal+sabzi+rice+roti",cal:620,desc:"Weekly reward meal"},
        {time:"5 PM",meal:"Herbal tea",cal:5,desc:"Tulsi or ginger"},
        {time:"8 PM",meal:"Khichdi + pickle",cal:340,desc:"Easy to digest"},
      ]},
    ]
  },
  {
    week:2,label:"Build Phase",
    days:[
      {d:"Mon",meals:[
        {time:"7 AM",meal:"Protein oats + berries",cal:380,desc:"Add whey or pea protein"},
        {time:"10 AM",meal:"Sprouts + lemon + chili",cal:190,desc:"Protein punch"},
        {time:"1 PM",meal:"Soya chunks curry + roti",cal:480,desc:"High protein"},
        {time:"4 PM",meal:"Banana + milk",cal:220,desc:"Pre/post workout"},
        {time:"7 PM",meal:"Egg curry (3 eggs) + rice",cal:520,desc:"Or paneer substitute"},
      ]},
      {d:"Tue",meals:[
        {time:"7 AM",meal:"Greek yogurt + granola",cal:350,desc:"High protein start"},
        {time:"10 AM",meal:"Walnuts + dates (3)",cal:200,desc:"Good fats"},
        {time:"1 PM",meal:"Chickpea+spinach curry + rice",cal:460,desc:"Iron rich"},
        {time:"4 PM",meal:"Protein shake",cal:150,desc:"Plant or whey"},
        {time:"7 PM",meal:"Grilled paneer + quinoa salad",cal:480,desc:"Balanced macro"},
      ]},
      {d:"Wed-Sun",meals:[
        {time:"Pattern",meal:"Similar high-protein rotation",cal:0,desc:"Increase protein by 10g/day. Add nuts, legumes."},
      ]},
    ]
  },
  {
    week:3,label:"Intensity",
    days:[
      {d:"All Days",meals:[
        {time:"7 AM",meal:"High protein breakfast 400+ cal",cal:400,desc:"Paneer/eggs/Greek yogurt base"},
        {time:"10 AM",meal:"Protein snack 200 cal",cal:200,desc:"Sprouts/nuts/protein shake"},
        {time:"1 PM",meal:"Complex carbs + protein 500 cal",cal:500,desc:"Rice/roti + legume/paneer curry"},
        {time:"4 PM",meal:"Pre-workout snack",cal:180,desc:"Banana + peanut butter"},
        {time:"7 PM",meal:"Light protein dinner",cal:420,desc:"Dal/tofu/paneer + veg"},
      ]},
    ]
  },
  {
    week:4,label:"Iron Core",
    days:[
      {d:"All Days",meals:[
        {time:"7 AM",meal:"Power breakfast: eggs+oats+nuts",cal:450,desc:"Peak nutrition for final push"},
        {time:"10 AM",meal:"Protein snack: sprouts+seeds",cal:220,desc:"Keep protein high"},
        {time:"1 PM",meal:"Champion's plate: full protein+carbs",cal:550,desc:"You've earned it"},
        {time:"4 PM",meal:"Coconut water + banana",cal:160,desc:"Natural energy"},
        {time:"7 PM",meal:"Recovery dinner: khichdi+curd",cal:380,desc:"Easy to digest, anti-inflammatory"},
      ]},
    ]
  },
];

// ─────────────────────────────────────────────
// ENHANCED SVG EXERCISE FIGURES
// ─────────────────────────────────────────────

function ExFigure({ name }: { name: string }) {
  const glow = `
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  `;

  const defs = (extra?: string) => `
    <defs>
      ${glow}
      <radialGradient id="headGrad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#e8d8b8"/>
        <stop offset="100%" stop-color="#9a8060"/>
      </radialGradient>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#5a6450"/>
        <stop offset="100%" stop-color="#2a3020"/>
      </linearGradient>
      <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#d94025"/>
        <stop offset="100%" stop-color="#8b1a0a"/>
      </linearGradient>
      ${extra || ''}
    </defs>
  `;

  if (name === 'Plank Hold') {
    return (
      <svg viewBox="0 0 240 110" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="110" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="88" x2="220" y2="88" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Forearms on ground */}
        <rect x="40" y="80" width="22" height="8" rx="4" fill="url(#bodyGrad)"/>
        <rect x="140" y="80" width="22" height="8" rx="4" fill="url(#bodyGrad)"/>
        {/* Core/torso - highlighted red */}
        <rect x="75" y="60" width="70" height="18" rx="6" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.95"/>
        {/* Upper body */}
        <rect x="38" y="60" width="40" height="16" rx="6" fill="url(#bodyGrad)"/>
        {/* Lower body */}
        <rect x="148" y="60" width="40" height="16" rx="6" fill="url(#bodyGrad)"/>
        {/* Feet */}
        <ellipse cx="196" cy="80" rx="10" ry="6" fill="url(#bodyGrad)"/>
        {/* Head */}
        <circle cx="32" cy="58" r="12" fill="url(#headGrad)"/>
        <circle cx="29" cy="56" r="1.5" fill="#3a2820"/>
        <circle cx="35" cy="56" r="1.5" fill="#3a2820"/>
        <path d="M30 61 Q32 63 34 61" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* Labels */}
        <text x="90" y="54" fontFamily="monospace" fontSize="7" fill="#d94025" fontWeight="bold">CORE TIGHT</text>
        <text x="85" y="102" fontFamily="monospace" fontSize="7" fill="#8b8355">BACK FLAT — STRAIGHT LINE</text>
        <text x="152" y="54" fontFamily="monospace" fontSize="7" fill="#8b8355">BACK FLAT</text>
      </svg>
    );
  }

  if (name === 'Hollow Body') {
    return (
      <svg viewBox="0 0 240 110" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="110" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="82" x2="220" y2="82" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Back on floor - highlighted */}
        <rect x="60" y="72" width="90" height="10" rx="5" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.9"/>
        <text x="78" y="70" fontFamily="monospace" fontSize="7" fill="#d94025" fontWeight="bold">BACK DOWN</text>
        {/* Arms overhead */}
        <rect x="22" y="68" width="40" height="8" rx="4" fill="url(#bodyGrad)"/>
        {/* Torso upper */}
        <rect x="60" y="64" width="45" height="12" rx="5" fill="url(#bodyGrad)"/>
        {/* Legs raised at 45deg */}
        <rect x="148" y="48" width="50" height="11" rx="5" fill="url(#bodyGrad)" transform="rotate(-40 148 53)"/>
        <ellipse cx="196" cy="36" rx="9" ry="6" fill="url(#bodyGrad)"/>
        {/* Head */}
        <circle cx="32" cy="60" r="12" fill="url(#headGrad)"/>
        <circle cx="29" cy="58" r="1.5" fill="#3a2820"/>
        <circle cx="35" cy="58" r="1.5" fill="#3a2820"/>
        <path d="M30 63 Q32 65 34 63" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* 45deg label */}
        <text x="175" y="34" fontFamily="monospace" fontSize="7" fill="#8b8355">45° HOLD</text>
        <text x="22" y="62" fontFamily="monospace" fontSize="6" fill="#8b8355">ARMS</text>
        <text x="20" y="70" fontFamily="monospace" fontSize="6" fill="#8b8355">BACK</text>
      </svg>
    );
  }

  if (name === 'Leg Raises') {
    return (
      <svg viewBox="0 0 240 130" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="130" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="98" x2="220" y2="98" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Torso on floor */}
        <rect x="55" y="86" width="80" height="12" rx="5" fill="url(#bodyGrad)"/>
        {/* Hands under butt */}
        <ellipse cx="140" cy="95" rx="10" ry="5" fill="url(#bodyGrad)" opacity="0.7"/>
        {/* Legs down (dashed - starting pos) */}
        <rect x="148" y="86" width="50" height="10" rx="5" fill="#3a4032" strokeDasharray="4 3" stroke="#5a6450" strokeWidth="1"/>
        {/* Legs up 90deg */}
        <rect x="178" y="30" width="12" height="56" rx="5" fill="url(#muscleGrad)" filter="url(#glow)"/>
        <rect x="193" y="30" width="12" height="56" rx="5" fill="url(#muscleGrad)" filter="url(#glow)"/>
        {/* Arrow */}
        <path d="M170 85 L170 35 L165 45 M170 35 L175 45" stroke="#d94025" strokeWidth="1.5" fill="none"/>
        {/* Head */}
        <circle cx="42" cy="84" r="11" fill="url(#headGrad)"/>
        <circle cx="39" cy="82" r="1.5" fill="#3a2820"/>
        <circle cx="45" cy="82" r="1.5" fill="#3a2820"/>
        <path d="M40 87 Q42 89 44 87" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* Labels */}
        <text x="155" y="22" fontFamily="monospace" fontSize="7" fill="#d94025" fontWeight="bold">UP 90°</text>
        <text x="148" y="115" fontFamily="monospace" fontSize="6" fill="#5a6450">START (down)</text>
        <text x="45" y="115" fontFamily="monospace" fontSize="7" fill="#8b8355">HANDS UNDER BACK</text>
        <text x="163" y="110" fontFamily="monospace" fontSize="6" fill="#8b8355">3 SEC↓</text>
      </svg>
    );
  }

  if (name === 'Dead Bug') {
    return (
      <svg viewBox="0 0 240 110" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="110" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="82" x2="220" y2="82" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Back on floor */}
        <rect x="68" y="70" width="80" height="12" rx="5" fill="url(#bodyGrad)"/>
        {/* Left arm up (dim - not active) */}
        <rect x="62" y="40" width="8" height="30" rx="4" fill="#3a4032"/>
        {/* Right arm extending (highlighted) */}
        <rect x="22" y="60" width="44" height="8" rx="4" fill="url(#muscleGrad)" filter="url(#glow)"/>
        {/* Right leg bent (dim) */}
        <rect x="148" y="58" width="10" height="25" rx="4" fill="#3a4032" transform="rotate(20 148 58)"/>
        {/* Left leg extending (highlighted) */}
        <rect x="155" y="62" width="55" height="9" rx="4" fill="url(#muscleGrad)" filter="url(#glow)" transform="rotate(-10 155 66)"/>
        {/* Head */}
        <circle cx="84" cy="64" r="12" fill="url(#headGrad)"/>
        <circle cx="81" cy="62" r="1.5" fill="#3a2820"/>
        <circle cx="87" cy="62" r="1.5" fill="#3a2820"/>
        <path d="M82 67 Q84 69 86 67" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* Labels */}
        <text x="22" y="56" fontFamily="monospace" fontSize="6" fill="#d94025" fontWeight="bold">RIGHT ARM</text>
        <text x="155" y="56" fontFamily="monospace" fontSize="6" fill="#d94025" fontWeight="bold">LEFT LEG</text>
        <text x="60" y="102" fontFamily="monospace" fontSize="7" fill="#8b8355">OPP. ARM + LEG EXTENDED</text>
      </svg>
    );
  }

  if (name === 'Bicycle Crunches') {
    return (
      <svg viewBox="0 0 240 120" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="120" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="92" x2="220" y2="92" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Back */}
        <rect x="60" y="76" width="70" height="14" rx="6" fill="url(#bodyGrad)"/>
        {/* Torso rotated */}
        <rect x="55" y="62" width="45" height="16" rx="6" fill="url(#bodyGrad)" transform="rotate(-15 78 70)"/>
        {/* Left elbow to right knee - meeting point highlight */}
        <circle cx="130" cy="65" r="12" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.7"/>
        {/* Right elbow */}
        <rect x="50" y="48" width="30" height="8" rx="4" fill="url(#bodyGrad)" transform="rotate(-30 65 52)"/>
        {/* Right knee driving up (highlighted) */}
        <rect x="135" y="55" width="10" height="30" rx="5" fill="url(#muscleGrad)" filter="url(#glow)"/>
        {/* Left leg extended low */}
        <rect x="148" y="84" width="50" height="9" rx="4" fill="url(#bodyGrad)" transform="rotate(-8 148 88)"/>
        {/* Rotation arc */}
        <path d="M85 55 Q110 45 130 65" stroke="#d94025" strokeWidth="1.5" fill="none" strokeDasharray="3 2"/>
        {/* Head */}
        <circle cx="68" cy="58" r="11" fill="url(#headGrad)"/>
        <circle cx="65" cy="56" r="1.5" fill="#3a2820"/>
        <circle cx="71" cy="56" r="1.5" fill="#3a2820"/>
        <path d="M66 61 Q68 63 70 61" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* Labels */}
        <text x="118" y="52" fontFamily="monospace" fontSize="6" fill="#d94025" fontWeight="bold">MEET</text>
        <text x="40" y="110" fontFamily="monospace" fontSize="7" fill="#8b8355">FULL ROTATION — ELBOW TO KNEE</text>
      </svg>
    );
  }

  if (name === 'Mountain Climbers') {
    return (
      <svg viewBox="0 0 240 110" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="110" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="88" x2="220" y2="88" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Arms straight (push-up pos) */}
        <rect x="42" y="60" width="12" height="26" rx="5" fill="url(#bodyGrad)"/>
        <rect x="148" y="60" width="12" height="26" rx="5" fill="url(#bodyGrad)"/>
        {/* Hands on floor */}
        <ellipse cx="48" cy="87" rx="8" ry="4" fill="url(#bodyGrad)"/>
        <ellipse cx="154" cy="87" rx="8" ry="4" fill="url(#bodyGrad)"/>
        {/* Core/torso */}
        <rect x="55" y="54" width="95" height="16" rx="6" fill="url(#bodyGrad)"/>
        {/* Knee driving to chest (highlighted) */}
        <rect x="130" y="46" width="10" height="36" rx="5" fill="url(#muscleGrad)" filter="url(#glow)" transform="rotate(40 135 64)"/>
        {/* Drive knee arrow */}
        <path d="M142 66 L125 52 L120 60 M125 52 L132 56" stroke="#d94025" strokeWidth="1.5" fill="none"/>
        {/* Feet */}
        <ellipse cx="188" cy="87" rx="10" ry="5" fill="url(#bodyGrad)"/>
        {/* Head */}
        <circle cx="34" cy="56" r="12" fill="url(#headGrad)"/>
        <circle cx="31" cy="54" r="1.5" fill="#3a2820"/>
        <circle cx="37" cy="54" r="1.5" fill="#3a2820"/>
        <path d="M32 59 Q34 61 36 59" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* Labels */}
        <text x="115" y="40" fontFamily="monospace" fontSize="7" fill="#d94025" fontWeight="bold">DRIVE KNEE</text>
        <text x="40" y="102" fontFamily="monospace" fontSize="7" fill="#8b8355">HIPS LEVEL — ARMS LOCKED</text>
      </svg>
    );
  }

  if (name === 'Flutter Kicks') {
    return (
      <svg viewBox="0 0 240 110" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="110" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="88" x2="220" y2="88" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Torso */}
        <rect x="55" y="74" width="80" height="14" rx="6" fill="url(#bodyGrad)"/>
        {/* Hands under butt */}
        <ellipse cx="138" cy="86" rx="12" ry="5" fill="url(#bodyGrad)" opacity="0.7"/>
        {/* Leg 1 UP (highlighted red) */}
        <rect x="148" y="48" width="12" height="38" rx="5" fill="url(#muscleGrad)" filter="url(#glow)"/>
        {/* Leg 2 mid (gold dashed) */}
        <rect x="165" y="60" width="12" height="30" rx="5" fill="#c9941a" opacity="0.7" strokeDasharray="3 2" stroke="#e8b347" strokeWidth="1"/>
        {/* Labels */}
        <text x="140" y="42" fontFamily="monospace" fontSize="7" fill="#d94025" fontWeight="bold">UP</text>
        <text x="160" y="54" fontFamily="monospace" fontSize="7" fill="#c9941a">MID</text>
        {/* Head */}
        <circle cx="42" cy="72" r="12" fill="url(#headGrad)"/>
        <circle cx="39" cy="70" r="1.5" fill="#3a2820"/>
        <circle cx="45" cy="70" r="1.5" fill="#3a2820"/>
        <path d="M40 75 Q42 77 44 75" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* Labels */}
        <text x="28" y="102" fontFamily="monospace" fontSize="7" fill="#8b8355">ALTERNATE FAST — LEGS STRAIGHT</text>
        <text x="38" y="62" fontFamily="monospace" fontSize="6" fill="#8b8355">HANDS</text>
        <text x="35" y="70" fontFamily="monospace" fontSize="6" fill="#8b8355">UNDER BUTT</text>
      </svg>
    );
  }

  if (name === 'Side Plank L') {
    return (
      <svg viewBox="0 0 240 110" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="110" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="90" x2="220" y2="90" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Full body diagonal */}
        <rect x="40" y="52" width="150" height="16" rx="7" fill="url(#bodyGrad)" transform="rotate(-12 115 60)"/>
        {/* Hip lifted highlight */}
        <ellipse cx="118" cy="62" rx="18" ry="10" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.85"/>
        {/* Left elbow on floor */}
        <ellipse cx="48" cy="88" rx="10" ry="5" fill="url(#bodyGrad)"/>
        {/* Free arm up */}
        <rect x="110" y="35" width="8" height="28" rx="4" fill="url(#bodyGrad)" transform="rotate(10 114 49)"/>
        {/* Feet stack */}
        <ellipse cx="198" cy="74" rx="10" ry="5" fill="url(#bodyGrad)" transform="rotate(-12 198 74)"/>
        {/* Head */}
        <circle cx="38" cy="68" r="12" fill="url(#headGrad)"/>
        <circle cx="35" cy="66" r="1.5" fill="#3a2820"/>
        <circle cx="41" cy="66" r="1.5" fill="#3a2820"/>
        <path d="M36 71 Q38 73 40 71" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* Labels */}
        <text x="104" y="48" fontFamily="monospace" fontSize="7" fill="#d94025" fontWeight="bold">HIPS LIFTED</text>
        <text x="55" y="104" fontFamily="monospace" fontSize="7" fill="#8b8355">LEFT ELBOW — BODY DIAGONAL</text>
      </svg>
    );
  }

  if (name === 'Side Plank R') {
    return (
      <svg viewBox="0 0 240 110" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="110" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="90" x2="220" y2="90" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Full body diagonal (mirrored) */}
        <rect x="50" y="52" width="150" height="16" rx="7" fill="url(#bodyGrad)" transform="rotate(12 125 60)"/>
        {/* Hip lifted highlight */}
        <ellipse cx="122" cy="62" rx="18" ry="10" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.85"/>
        {/* Right elbow on floor */}
        <ellipse cx="194" cy="88" rx="10" ry="5" fill="url(#bodyGrad)"/>
        {/* Free arm up */}
        <rect x="122" y="35" width="8" height="28" rx="4" fill="url(#bodyGrad)" transform="rotate(-10 126 49)"/>
        {/* Feet stack */}
        <ellipse cx="44" cy="74" rx="10" ry="5" fill="url(#bodyGrad)" transform="rotate(12 44 74)"/>
        {/* Head */}
        <circle cx="202" cy="68" r="12" fill="url(#headGrad)"/>
        <circle cx="199" cy="66" r="1.5" fill="#3a2820"/>
        <circle cx="205" cy="66" r="1.5" fill="#3a2820"/>
        <path d="M200 71 Q202 73 204 71" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* Labels */}
        <text x="104" y="48" fontFamily="monospace" fontSize="7" fill="#d94025" fontWeight="bold">HIPS LIFTED</text>
        <text x="50" y="104" fontFamily="monospace" fontSize="7" fill="#8b8355">RIGHT ELBOW — BODY DIAGONAL</text>
      </svg>
    );
  }

  if (name === 'Side Plank L+R') {
    return (
      <svg viewBox="0 0 240 120" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="120" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Left side mini figure */}
        <line x1="20" y1="90" x2="110" y2="90" stroke="#3a4032" strokeWidth="1"/>
        <rect x="30" y="62" width="68" height="12" rx="5" fill="url(#bodyGrad)" transform="rotate(-12 64 68)"/>
        <ellipse cx="36" cy="88" rx="7" ry="4" fill="url(#bodyGrad)"/>
        <ellipse cx="38" cy="72" rx="10" ry="7" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.8"/>
        <circle cx="28" cy="68" r="9" fill="url(#headGrad)"/>
        <text x="28" y="102" fontFamily="monospace" fontSize="7" fill="#c9941a">LEFT</text>
        {/* Divider */}
        <line x1="120" y1="30" x2="120" y2="100" stroke="#3a4032" strokeWidth="1" strokeDasharray="3 3"/>
        {/* Right side mini figure */}
        <line x1="130" y1="90" x2="220" y2="90" stroke="#3a4032" strokeWidth="1"/>
        <rect x="138" y="62" width="68" height="12" rx="5" fill="url(#bodyGrad)" transform="rotate(12 172 68)"/>
        <ellipse cx="202" cy="88" rx="7" ry="4" fill="url(#bodyGrad)"/>
        <ellipse cx="200" cy="72" rx="10" ry="7" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.8"/>
        <circle cx="210" cy="68" r="9" fill="url(#headGrad)"/>
        <text x="168" y="102" fontFamily="monospace" fontSize="7" fill="#c9941a">RIGHT</text>
        {/* Center label */}
        <text x="40" y="114" fontFamily="monospace" fontSize="7" fill="#8b8355">BOTH SIDES EQUAL — NO CHEATING</text>
      </svg>
    );
  }

  if (name === 'V-Sit Hold') {
    return (
      <svg viewBox="0 0 240 130" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
        <rect width="240" height="130" fill="#060605" rx="6"/>
        <g dangerouslySetInnerHTML={{__html: defs()}}/>
        {/* Floor */}
        <line x1="20" y1="100" x2="220" y2="100" stroke="#3a4032" strokeWidth="1.5"/>
        {/* Sit bones on floor */}
        <ellipse cx="120" cy="99" rx="14" ry="5" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.85"/>
        <text x="98" y="114" fontFamily="monospace" fontSize="7" fill="#d94025" fontWeight="bold">SIT BONES ONLY</text>
        {/* Torso at 45deg back */}
        <rect x="88" y="55" width="14" height="46" rx="6" fill="url(#bodyGrad)" transform="rotate(-40 95 78)"/>
        {/* Legs at 45deg up */}
        <rect x="120" y="40" width="60" height="12" rx="5" fill="url(#muscleGrad)" filter="url(#glow)" transform="rotate(-40 120 46)"/>
        {/* Arms forward */}
        <rect x="82" y="70" width="42" height="8" rx="4" fill="url(#bodyGrad)" transform="rotate(-35 103 74)"/>
        {/* V shape indicator */}
        <path d="M80 98 L120 60 L165 35" stroke="#d94025" strokeWidth="1" fill="none" strokeDasharray="4 2" opacity="0.5"/>
        {/* Head */}
        <circle cx="74" cy="68" r="13" fill="url(#headGrad)"/>
        <circle cx="71" cy="66" r="1.5" fill="#3a2820"/>
        <circle cx="77" cy="66" r="1.5" fill="#3a2820"/>
        <path d="M72 71 Q74 73 76 71" stroke="#3a2820" strokeWidth="1" fill="none"/>
        {/* V label */}
        <text x="155" y="30" fontFamily="monospace" fontSize="9" fill="#8b8355" fontWeight="bold">V</text>
        <text x="50" y="90" fontFamily="monospace" fontSize="7" fill="#8b8355">45°</text>
        <text x="150" y="55" fontFamily="monospace" fontSize="7" fill="#8b8355">45°</text>
      </svg>
    );
  }

  // Fallback for any exercise not specifically designed
  return (
    <svg viewBox="0 0 240 110" style={{width:'100%',maxWidth:360,display:'block',margin:'0 auto'}} xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="110" fill="#060605" rx="6"/>
      <g dangerouslySetInnerHTML={{__html: defs()}}/>
      <line x1="20" y1="88" x2="220" y2="88" stroke="#3a4032" strokeWidth="1.5"/>
      <circle cx="120" cy="55" r="20" fill="url(#muscleGrad)" filter="url(#glow)" opacity="0.6"/>
      <text x="90" y="59" fontFamily="monospace" fontSize="8" fill="#e8d8b8" fontWeight="bold">{name.slice(0,12)}</text>
      <text x="60" y="102" fontFamily="monospace" fontSize="7" fill="#8b8355">SEE FORM CUES BELOW</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function toRoman(n: number): string {
  if (n === 1) return 'I';
  if (n === 2) return 'II';
  if (n === 3) return 'III';
  return String(n);
}

function formatTimer(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

export default function IronCoreWorkoutPage() {
  const [currentDay, setCurrentDay] = useState(1);
  const [completed, setCompleted] = useState<Record<string, (number | string)[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [prs, setPrs] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'workout'|'diet'|'habits'|'ancient'|'donts'|'quotes'|'cal'|'records'>('workout');
  const [openPanels, setOpenPanels] = useState<Set<number>>(new Set());
  const [timerVal, setTimerVal] = useState(30);
  const [timerDef, setTimerDef] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const [calWeek, setCalWeek] = useState(0);
  const [openDiet, setOpenDiet] = useState<Set<string>>(new Set());
  const [openTech, setOpenTech] = useState<Set<string>>(new Set());
  const [showReset, setShowReset] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const s = localStorage.getItem('ironcore_v2');
      if (s) {
        const d = JSON.parse(s);
        if (d.day) setCurrentDay(d.day);
        if (d.done) setCompleted(d.done);
        if (d.notes) setNotes(d.notes);
        if (d.prs) setPrs(d.prs);
      }
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ironcore_v2', JSON.stringify({ day: currentDay, done: completed, notes, prs }));
    } catch {}
  }, [currentDay, completed, notes, prs]);

  // Sync note text when changing day
  useEffect(() => {
    setNoteText(notes[String(currentDay)] || '');
    setEditNote(false);
  }, [currentDay, notes]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerVal(v => {
          if (v <= 1) {
            setTimerRunning(false);
            setTimerDone(true);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Stats
  const streak = (() => {
    let s = 0;
    for (let i = currentDay; i >= 1; i--) {
      if (completed[String(i)] && completed[String(i)].length > 0) s++;
      else break;
    }
    return s;
  })();

  const totalDone = Object.keys(completed).length;

  const totalReps = (() => {
    let sum = 0;
    for (const [dayKey, exArr] of Object.entries(completed)) {
      const dayNum = parseInt(dayKey);
      const prog = PROGRAM.find(p => p.day === dayNum);
      if (prog && !prog.rest && 'ex' in prog) {
        (prog.ex as readonly {nm:string;r:number;u:string;d?:string}[]).forEach((ex, idx) => {
          if ((exArr as (number|string)[]).includes(idx)) {
            sum += ex.r;
          }
        });
      }
    }
    return sum;
  })();

  const todayData = PROGRAM.find(p => p.day === currentDay);
  const todayExs = (!todayData || todayData.rest || !('ex' in todayData)) ? [] : (todayData.ex as readonly {nm:string;r:number;u:string;d?:string}[]);
  const todayDone = completed[String(currentDay)] || [];
  const allDone = todayData?.rest
    ? (todayDone.includes('rest'))
    : (todayExs.length > 0 && todayExs.every((_, i) => todayDone.includes(i)));

  const toggleExercise = useCallback((dayNum: number, exIdx: number) => {
    setCompleted(prev => {
      const key = String(dayNum);
      const arr = [...(prev[key] || [])] as (number|string)[];
      const pos = arr.indexOf(exIdx);
      if (pos >= 0) arr.splice(pos, 1); else arr.push(exIdx);
      return { ...prev, [key]: arr };
    });
  }, []);

  const logRest = useCallback((dayNum: number) => {
    setCompleted(prev => ({ ...prev, [String(dayNum)]: ['rest'] }));
  }, []);

  const nextDay = useCallback(() => {
    if (currentDay < 30) setCurrentDay(d => d + 1);
  }, [currentDay]);

  const confirmReset = useCallback(() => {
    setCurrentDay(1);
    setCompleted({});
    setNotes({});
    setPrs({});
    setShowReset(false);
    try { localStorage.removeItem('ironcore_v2'); } catch {}
  }, []);

  const togglePanel = (idx: number) => {
    setOpenPanels(prev => {
      const s = new Set(prev);
      if (s.has(idx)) s.delete(idx); else s.add(idx);
      return s;
    });
  };

  const saveNote = () => {
    setNotes(prev => ({ ...prev, [String(currentDay)]: noteText }));
    setEditNote(false);
  };

  const setTimer = (val: number) => {
    setTimerRunning(false);
    setTimerVal(val);
    setTimerDef(val);
    setTimerDone(false);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerVal(timerDef);
    setTimerDone(false);
  };

  const phaseColors: Record<number, string> = { 1: '#4a5240', 2: '#2d6b4a', 3: '#b5341e' };
  const phaseNames: Record<number, string> = { 1: 'FOUNDATION', 2: 'ENDURANCE', 3: 'IRON CORE' };

  // Calendar week days
  const calStart = calWeek * 7 + 1;
  const calDays = Array.from({ length: 7 }, (_, i) => calStart + i).filter(d => d <= 30);

  const tabs: {id: typeof tab; label: string}[] = [
    {id:'workout', label:'💪 WORKOUT'},
    {id:'diet', label:'🥗 DIET'},
    {id:'habits', label:'🌅 HABITS'},
    {id:'ancient', label:'🕉 ANCIENT'},
    {id:'donts', label:'🚫 DON\'TS'},
    {id:'quotes', label:'🔥 FIRE'},
    {id:'cal', label:'📅 MAP'},
    {id:'records', label:'🏆 RECORDS'},
  ];

  const PR_EXERCISES = ['Plank Hold','Hollow Body','V-Sit Hold','Leg Raises','Bicycle Crunches','Flutter Kicks','Mountain Climbers','Side Plank L','Side Plank R'];

  return (
    <>
      <Header />
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .ticker-inner { animation: ticker 22s linear infinite; white-space: nowrap; }
        .tab-btn { transition: all 0.15s; }
        .tab-btn:hover { background: #1e2018 !important; }
        .ex-row { transition: background 0.12s; cursor: pointer; }
        .ex-row:hover { background: #181a14 !important; }
        .pill-btn { transition: all 0.15s; }
        .pill-btn:hover { opacity: 0.85; }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 8px #d94025aa} 50%{box-shadow:0 0 22px #d94025} }
        .timer-done { animation: pulse-glow 1s ease-in-out infinite; }
      `}</style>
      <main id="main-content" style={{background:'#0a0a08', minHeight:'100vh', paddingBottom:60}}>

        {/* Header spacer */}
        <div style={{height:64}} />

        {/* TICKER */}
        <div style={{background:'#b5341e', overflow:'hidden', height:32, display:'flex', alignItems:'center'}}>
          <div className="ticker-inner" style={{color:'#fff', fontFamily:'monospace', fontSize:12, fontWeight:'bold', letterSpacing:2}}>
            &nbsp;&nbsp;&nbsp;&nbsp;⚡ IRON CORE — 30-DAY MILITARY CALISTHENICS &nbsp;|&nbsp; NO EXCUSES &nbsp;|&nbsp; DISCIPLINE OVER MOTIVATION &nbsp;|&nbsp; MIND OVER MUSCLE &nbsp;|&nbsp; FORGED NOT BORN &nbsp;|&nbsp; EVERY REP COUNTS &nbsp;|&nbsp; YOUR ONLY LIMIT IS YOUR LAST BREATH &nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* HERO HEADER */}
        <div style={{background:'linear-gradient(180deg, #0f100c 0%, #0a0a08 100%)', padding:'32px 16px 20px', textAlign:'center', borderBottom:'1px solid #1e2018'}}>
          <div style={{display:'inline-block', background:'#1a1b16', border:'1px solid #3a4032', borderRadius:4, padding:'4px 14px', marginBottom:14}}>
            <span style={{fontFamily:'monospace', fontSize:10, color:'#8b8355', letterSpacing:3}}>◆ IRON CORE · 30-DAY MILITARY PROTOCOL</span>
          </div>
          <h1 style={{fontFamily:'monospace', fontWeight:900, fontSize:'clamp(36px,8vw,72px)', color:'#ede8d8', margin:0, letterSpacing:-1, lineHeight:1}}>
            IRON<span style={{color:'#d94025'}}>CORE</span>
          </h1>
          <p style={{fontFamily:'monospace', fontSize:11, color:'#4a5240', letterSpacing:6, marginTop:8, marginBottom:0}}>
            BODY · MIND · SPIRIT · DISCIPLINE
          </p>
        </div>

        {/* STATS STRIP */}
        <div style={{background:'#111210', borderBottom:'1px solid #1e2018', overflowX:'auto'}}>
          <div style={{display:'flex', minWidth:460, padding:'10px 16px', gap:0}}>
            {[
              {label:'DAY', val:`${currentDay}/30`},
              {label:'STREAK', val:`${streak}🔥`},
              {label:'DONE', val:String(totalDone)},
              {label:'REPS', val:String(totalReps)},
              {label:'PHASE', val:`PH ${toRoman(todayData?.phase || 1)}`},
            ].map((stat, i) => (
              <div key={i} style={{flex:1, textAlign:'center', padding:'6px 8px', borderRight: i < 4 ? '1px solid #1e2018' : 'none'}}>
                <div style={{fontFamily:'monospace', fontSize:9, color:'#4a5240', letterSpacing:2, marginBottom:2}}>{stat.label}</div>
                <div style={{fontFamily:'monospace', fontSize:16, fontWeight:'bold', color:'#c9941a'}}>{stat.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{maxWidth:680, margin:'0 auto', padding:'0 0 40px'}}>

          {/* TAB NAV */}
          <div style={{overflowX:'auto', background:'#0f100c', borderBottom:'2px solid #1e2018'}}>
            <div style={{display:'flex', minWidth:520}}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  className="tab-btn"
                  onClick={() => setTab(t.id)}
                  style={{
                    flex:1,
                    padding:'10px 4px',
                    fontFamily:'monospace',
                    fontSize:10,
                    fontWeight:'bold',
                    letterSpacing:0.5,
                    background: tab === t.id ? '#1a1b16' : 'transparent',
                    color: tab === t.id ? '#d94025' : '#4a5240',
                    border:'none',
                    borderBottom: tab === t.id ? '2px solid #d94025' : '2px solid transparent',
                    cursor:'pointer',
                    whiteSpace:'nowrap',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{padding:'16px 12px'}}>

            {/* ─── WORKOUT TAB ─── */}
            {tab === 'workout' && (
              <div>
                {/* Mission Card */}
                {todayData && (
                  <div style={{background:'#111210', border:`1px solid ${phaseColors[todayData.phase]}`, borderRadius:8, padding:'14px 16px', marginBottom:14}}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                      <div>
                        <span style={{fontFamily:'monospace', fontSize:9, color:'#4a5240', letterSpacing:3}}>
                          PHASE {toRoman(todayData.phase)} — {phaseNames[todayData.phase]}
                        </span>
                        <div style={{fontFamily:'monospace', fontSize:22, fontWeight:'bold', color:'#ede8d8', marginTop:2}}>
                          DAY <span style={{color:'#c9941a'}}>{todayData.day}</span>
                        </div>
                        <div style={{fontFamily:'monospace', fontSize:13, color:'#d94025', letterSpacing:2, marginTop:2}}>{todayData.name}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontFamily:'monospace', fontSize:9, color:'#4a5240', marginBottom:4}}>DIFFICULTY</div>
                        <div style={{fontSize:14}}>{Array.from({length:todayData.phase}).map((_,i)=><span key={i} style={{color:'#d94025'}}>◆</span>)}{Array.from({length:3-todayData.phase}).map((_,i)=><span key={i} style={{color:'#2a2b20'}}>◆</span>)}</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {!todayData.rest && todayExs.length > 0 && (
                      <div style={{marginTop:6}}>
                        <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}>
                          <span style={{fontFamily:'monospace', fontSize:9, color:'#4a5240'}}>PROGRESS</span>
                          <span style={{fontFamily:'monospace', fontSize:9, color:'#c9941a'}}>{todayDone.length}/{todayExs.length}</span>
                        </div>
                        <div style={{background:'#1e2018', borderRadius:4, height:5}}>
                          <div style={{background:'#d94025', height:'100%', borderRadius:4, width:`${(todayDone.length/todayExs.length)*100}%`, transition:'width 0.3s'}}/>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Rest Day */}
                {todayData?.rest && (
                  <div style={{background:'#0f100c', border:'1px solid #2a2b20', borderRadius:8, padding:20, textAlign:'center', marginBottom:14}}>
                    <div style={{fontSize:40, marginBottom:8}}>🌙</div>
                    <div style={{fontFamily:'monospace', fontSize:16, color:'#8b8355', fontWeight:'bold', marginBottom:4}}>REST & RECOVER</div>
                    <div style={{fontFamily:'monospace', fontSize:11, color:'#4a5240', marginBottom:14}}>Muscle is built during recovery. Honor the rest.</div>
                    {!todayDone.includes('rest') ? (
                      <button
                        onClick={() => logRest(currentDay)}
                        style={{background:'#2d6b4a', border:'none', borderRadius:6, padding:'10px 28px', fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#ede8d8', cursor:'pointer', letterSpacing:2}}
                      >
                        LOG REST DAY
                      </button>
                    ) : (
                      <div style={{fontFamily:'monospace', fontSize:12, color:'#2d6b4a', fontWeight:'bold'}}>✓ REST DAY LOGGED</div>
                    )}
                    {todayDone.includes('rest') && currentDay < 30 && (
                      <button
                        onClick={nextDay}
                        style={{background:'#d94025', border:'none', borderRadius:6, padding:'10px 28px', fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#fff', cursor:'pointer', letterSpacing:2, marginTop:10, display:'block', width:'100%'}}
                      >
                        NEXT MISSION →
                      </button>
                    )}
                  </div>
                )}

                {/* All Done Card */}
                {allDone && !todayData?.rest && (
                  <div style={{background:'#0d1a0f', border:'1px solid #2d6b4a', borderRadius:8, padding:16, textAlign:'center', marginBottom:14}}>
                    <div style={{fontSize:32, marginBottom:4}}>🏆</div>
                    <div style={{fontFamily:'monospace', fontSize:14, color:'#3d8b60', fontWeight:'bold', marginBottom:4}}>MISSION COMPLETE</div>
                    <div style={{fontFamily:'monospace', fontSize:10, color:'#2d6b4a', marginBottom:12}}>Day {currentDay} conquered. Soldier.</div>
                    {currentDay < 30 && (
                      <button
                        onClick={nextDay}
                        style={{background:'#d94025', border:'none', borderRadius:6, padding:'10px 28px', fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#fff', cursor:'pointer', letterSpacing:2, width:'100%'}}
                      >
                        NEXT MISSION →
                      </button>
                    )}
                    {currentDay === 30 && (
                      <div style={{fontFamily:'monospace', fontSize:14, color:'#c9941a', fontWeight:'bold'}}>⭐ 30-DAY IRON CORE COMPLETE ⭐</div>
                    )}
                  </div>
                )}

                {/* Exercise List */}
                {!todayData?.rest && todayExs.length > 0 && (
                  <div style={{marginBottom:16}}>
                    {todayExs.map((ex, i) => {
                      const done = todayDone.includes(i);
                      const panelOpen = openPanels.has(i);
                      const cues = EX_CUES[ex.nm];
                      return (
                        <div key={i} style={{marginBottom:6}}>
                          <div
                            className="ex-row"
                            onClick={() => toggleExercise(currentDay, i)}
                            style={{
                              background: done ? '#0d1a0f' : '#111210',
                              border: `1px solid ${done ? '#2d6b4a' : '#1e2018'}`,
                              borderRadius:6,
                              padding:'12px 14px',
                              display:'flex',
                              alignItems:'center',
                              gap:10,
                            }}
                          >
                            <div style={{
                              width:22, height:22, borderRadius:'50%',
                              border:`2px solid ${done ? '#2d6b4a' : '#3a4032'}`,
                              background: done ? '#2d6b4a' : 'transparent',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              flexShrink:0, fontSize:12, color:'#ede8d8',
                            }}>
                              {done ? '✓' : ''}
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontFamily:'monospace', fontSize:13, fontWeight:'bold', color: done ? '#3d8b60' : '#ede8d8'}}>
                                {ex.nm}
                                {'d' in ex && ex.d && <span style={{marginLeft:6, fontSize:10, color:'#8b8355', fontWeight:'normal'}}>{ex.d}</span>}
                              </div>
                              <div style={{fontFamily:'monospace', fontSize:11, color:'#4a5240', marginTop:2}}>
                                {ex.r} sets
                              </div>
                            </div>
                            <div style={{fontFamily:'monospace', fontSize:13, fontWeight:'bold', color:'#c9941a', flexShrink:0}}>{ex.u}</div>
                            <button
                              onClick={e => { e.stopPropagation(); togglePanel(i); }}
                              style={{background:'transparent', border:'1px solid #3a4032', borderRadius:4, padding:'2px 6px', color:'#4a5240', cursor:'pointer', fontSize:14, flexShrink:0}}
                              title="View form"
                            >👁</button>
                          </div>

                          {/* Exercise panel */}
                          {panelOpen && (
                            <div style={{background:'#0c0d0a', border:'1px solid #1e2018', borderTop:'none', borderRadius:'0 0 6px 6px', padding:14}}>
                              <ExFigure name={ex.nm} />
                              {cues && (
                                <div style={{marginTop:12}}>
                                  {cues.map((c, ci) => (
                                    <div
                                      key={ci}
                                      style={{
                                        fontFamily:'monospace',
                                        fontSize:11,
                                        color: c.w ? '#d94025' : '#8b8355',
                                        marginBottom:5,
                                        paddingLeft:8,
                                        borderLeft: `2px solid ${c.w ? '#d94025' : '#3a4032'}`,
                                      }}
                                      dangerouslySetInnerHTML={{__html: c.t}}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* REST TIMER */}
                {!todayData?.rest && (
                  <div style={{background:'#111210', border:'1px solid #1e2018', borderRadius:8, padding:16, marginBottom:14}}>
                    <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:3, marginBottom:10}}>REST TIMER</div>
                    <div
                      className={timerDone ? 'timer-done' : ''}
                      style={{
                        fontFamily:'monospace',
                        fontSize:48,
                        fontWeight:'bold',
                        color: timerDone ? '#d94025' : timerRunning ? '#c9941a' : '#ede8d8',
                        textAlign:'center',
                        letterSpacing:4,
                        marginBottom:12,
                        borderRadius:8,
                        padding:'8px 0',
                      }}
                    >
                      {formatTimer(timerVal)}
                    </div>
                    <div style={{display:'flex', gap:8, marginBottom:10, justifyContent:'center'}}>
                      <button
                        onClick={() => { setTimerRunning(r => !r); setTimerDone(false); }}
                        style={{
                          background: timerRunning ? '#3a4032' : '#d94025',
                          border:'none', borderRadius:6, padding:'10px 28px',
                          fontFamily:'monospace', fontSize:13, fontWeight:'bold',
                          color:'#fff', cursor:'pointer', letterSpacing:2,
                        }}
                      >
                        {timerRunning ? 'PAUSE' : 'START'}
                      </button>
                      <button
                        onClick={resetTimer}
                        style={{background:'#1e2018', border:'1px solid #3a4032', borderRadius:6, padding:'10px 16px', fontFamily:'monospace', fontSize:12, color:'#8b8355', cursor:'pointer'}}
                      >
                        RESET
                      </button>
                    </div>
                    <div style={{display:'flex', gap:6, justifyContent:'center'}}>
                      {[30,45,60,90].map(v => (
                        <button
                          key={v}
                          className="pill-btn"
                          onClick={() => setTimer(v)}
                          style={{
                            background: timerDef === v ? '#2a3020' : '#1a1b16',
                            border: `1px solid ${timerDef === v ? '#4a5240' : '#2a2b20'}`,
                            borderRadius:20, padding:'4px 12px',
                            fontFamily:'monospace', fontSize:11,
                            color: timerDef === v ? '#c9941a' : '#4a5240',
                            cursor:'pointer',
                          }}
                        >
                          {v}s
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Day Notes */}
                <div style={{background:'#111210', border:'1px solid #1e2018', borderRadius:8, padding:14, marginBottom:14}}>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8}}>
                    <span style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:2}}>DAY {currentDay} NOTES</span>
                    <button
                      onClick={() => setEditNote(e => !e)}
                      style={{background:'transparent', border:'1px solid #3a4032', borderRadius:4, padding:'2px 10px', fontFamily:'monospace', fontSize:10, color:'#8b8355', cursor:'pointer'}}
                    >
                      {editNote ? 'CANCEL' : 'EDIT'}
                    </button>
                  </div>
                  {editNote ? (
                    <>
                      <textarea
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="Log PRs, feelings, observations..."
                        style={{width:'100%', background:'#0c0d0a', border:'1px solid #3a4032', borderRadius:4, padding:10, fontFamily:'monospace', fontSize:12, color:'#ede8d8', resize:'vertical', minHeight:80, boxSizing:'border-box'}}
                      />
                      <button
                        onClick={saveNote}
                        style={{marginTop:8, background:'#2d6b4a', border:'none', borderRadius:4, padding:'8px 20px', fontFamily:'monospace', fontSize:11, fontWeight:'bold', color:'#ede8d8', cursor:'pointer'}}
                      >
                        SAVE NOTE
                      </button>
                    </>
                  ) : (
                    <div style={{fontFamily:'monospace', fontSize:12, color: notes[String(currentDay)] ? '#8b8355' : '#3a4032', fontStyle: notes[String(currentDay)] ? 'normal' : 'italic', lineHeight:1.6}}>
                      {notes[String(currentDay)] || 'No notes for today. Tap EDIT to add.'}
                    </div>
                  )}
                </div>

                {/* Reset button */}
                <div style={{textAlign:'center'}}>
                  <button
                    onClick={() => setShowReset(true)}
                    style={{background:'transparent', border:'1px solid #3a4032', borderRadius:4, padding:'6px 18px', fontFamily:'monospace', fontSize:10, color:'#4a5240', cursor:'pointer'}}
                  >
                    RESET PROGRESS
                  </button>
                </div>
              </div>
            )}

            {/* ─── DIET TAB ─── */}
            {tab === 'diet' && (
              <div>
                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:3, marginBottom:16, textAlign:'center'}}>4-WEEK VEGETARIAN MEAL PROTOCOL</div>
                {DIET_WEEKS.map(week => (
                  <div key={week.week} style={{marginBottom:16}}>
                    <div
                      onClick={() => setOpenDiet(prev => { const s = new Set(prev); s.has(`w${week.week}`) ? s.delete(`w${week.week}`) : s.add(`w${week.week}`); return s; })}
                      style={{background:'#1a1b16', border:'1px solid #3a4032', borderRadius:6, padding:'12px 16px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}
                    >
                      <div>
                        <span style={{fontFamily:'monospace', fontSize:10, color:'#8b8355', letterSpacing:2}}>WEEK {week.week}</span>
                        <div style={{fontFamily:'monospace', fontSize:14, fontWeight:'bold', color:'#ede8d8', marginTop:2}}>{week.label}</div>
                      </div>
                      <span style={{color:'#4a5240', fontSize:16}}>{openDiet.has(`w${week.week}`) ? '▲' : '▼'}</span>
                    </div>
                    {openDiet.has(`w${week.week}`) && (
                      <div style={{background:'#0f100c', border:'1px solid #1e2018', borderTop:'none', borderRadius:'0 0 6px 6px', padding:12}}>
                        {week.days.map(day => (
                          <div key={day.d} style={{marginBottom:12}}>
                            <div
                              onClick={() => setOpenDiet(prev => { const s = new Set(prev); const k = `w${week.week}-${day.d}`; s.has(k) ? s.delete(k) : s.add(k); return s; })}
                              style={{fontFamily:'monospace', fontSize:11, fontWeight:'bold', color:'#c9941a', letterSpacing:2, cursor:'pointer', padding:'4px 0', borderBottom:'1px solid #1e2018', marginBottom:6, display:'flex', justifyContent:'space-between'}}
                            >
                              <span>{day.d}</span>
                              <span style={{color:'#3a4032'}}>{openDiet.has(`w${week.week}-${day.d}`) ? '▲' : '▼'}</span>
                            </div>
                            {openDiet.has(`w${week.week}-${day.d}`) && day.meals.map((meal, mi) => (
                              <div key={mi} style={{display:'flex', gap:10, marginBottom:8, padding:'6px 8px', background:'#111210', borderRadius:4}}>
                                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', flexShrink:0, width:52}}>{meal.time}</div>
                                <div style={{flex:1}}>
                                  <div style={{fontFamily:'monospace', fontSize:12, color:'#ede8d8'}}>{meal.meal}</div>
                                  <div style={{fontFamily:'monospace', fontSize:10, color:'#8b8355', marginTop:2}}>{meal.desc}</div>
                                </div>
                                {meal.cal > 0 && <div style={{fontFamily:'monospace', fontSize:10, color:'#c9941a', flexShrink:0}}>{meal.cal}kcal</div>}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ─── HABITS TAB ─── */}
            {tab === 'habits' && (
              <div>
                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:3, marginBottom:16, textAlign:'center'}}>DAILY OPERATING PROTOCOL</div>

                {/* Morning */}
                <div style={{marginBottom:16}}>
                  <div style={{fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#c9941a', letterSpacing:3, marginBottom:10, borderBottom:'1px solid #1e2018', paddingBottom:8}}>☀️ MORNING PROTOCOL</div>
                  {MORNING_HABITS.map((h, i) => (
                    <div key={i} style={{background:'#111210', border:'1px solid #1e2018', borderRadius:6, padding:'10px 14px', marginBottom:6, display:'flex', gap:12, alignItems:'flex-start'}}>
                      <span style={{fontSize:20, flexShrink:0}}>{h.icon}</span>
                      <div>
                        <div style={{fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#ede8d8'}}>{h.t}</div>
                        <div style={{fontFamily:'monospace', fontSize:11, color:'#8b8355', marginTop:3, lineHeight:1.5}}>{h.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Evening */}
                <div style={{marginBottom:16}}>
                  <div style={{fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#7a8a96', letterSpacing:3, marginBottom:10, borderBottom:'1px solid #1e2018', paddingBottom:8}}>🌙 EVENING PROTOCOL</div>
                  {EVENING_HABITS.map((h, i) => (
                    <div key={i} style={{background:'#111210', border:'1px solid #1e2018', borderRadius:6, padding:'10px 14px', marginBottom:6, display:'flex', gap:12, alignItems:'flex-start'}}>
                      <span style={{fontSize:20, flexShrink:0}}>{h.icon}</span>
                      <div>
                        <div style={{fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#ede8d8'}}>{h.t}</div>
                        <div style={{fontFamily:'monospace', fontSize:11, color:'#8b8355', marginTop:3, lineHeight:1.5}}>{h.d}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Daily Laws */}
                <div>
                  <div style={{fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#d94025', letterSpacing:3, marginBottom:10, borderBottom:'1px solid #1e2018', paddingBottom:8}}>⚖️ DAILY LAWS</div>
                  {DAILY_LAWS.map((law, i) => (
                    <div key={i} style={{background:'#111210', border:'1px solid #2a2b20', borderLeft:'3px solid #d94025', borderRadius:6, padding:'10px 14px', marginBottom:6}}>
                      <div style={{fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#ede8d8', marginBottom:4}}>{law.t}</div>
                      <div style={{fontFamily:'monospace', fontSize:11, color:'#8b8355', lineHeight:1.5}}>{law.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── ANCIENT TAB ─── */}
            {tab === 'ancient' && (
              <div>
                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:3, marginBottom:16, textAlign:'center'}}>ANCIENT WISDOM PRACTICES</div>
                {ANCIENT_TECHS.map((tech, i) => (
                  <div key={i} style={{marginBottom:8}}>
                    <div
                      onClick={() => setOpenTech(prev => { const s = new Set(prev); s.has(tech.t) ? s.delete(tech.t) : s.add(tech.t); return s; })}
                      style={{background:'#111210', border:'1px solid #1e2018', borderRadius:openTech.has(tech.t) ? '6px 6px 0 0' : 6, padding:'12px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}}
                    >
                      <div>
                        <span style={{background:'#1e2018', border:'1px solid #3a4032', borderRadius:3, padding:'2px 7px', fontFamily:'monospace', fontSize:9, color:'#8b8355', marginRight:8}}>{tech.tag}</span>
                        <span style={{fontFamily:'monospace', fontSize:13, fontWeight:'bold', color:'#ede8d8'}}>{tech.t}</span>
                      </div>
                      <span style={{color:'#4a5240'}}>{openTech.has(tech.t) ? '▲' : '▼'}</span>
                    </div>
                    {openTech.has(tech.t) && (
                      <div style={{background:'#0c0d0a', border:'1px solid #1e2018', borderTop:'none', borderRadius:'0 0 6px 6px', padding:'12px 14px'}}>
                        <p style={{fontFamily:'monospace', fontSize:12, color:'#8b8355', lineHeight:1.7, margin:0}}>{tech.d}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ─── DONTS TAB ─── */}
            {tab === 'donts' && (
              <div>
                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:3, marginBottom:16, textAlign:'center'}}>10 COMMANDMENTS — WHAT NOT TO DO</div>
                {DONT_LIST.map((dont, i) => (
                  <div key={i} style={{background:'#120a09', border:'1px solid #4a1a10', borderLeft:'3px solid #d94025', borderRadius:6, padding:'12px 14px', marginBottom:8}}>
                    <div style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                      <span style={{fontFamily:'monospace', fontSize:12, color:'#d94025', fontWeight:'bold', flexShrink:0}}>✗ {String(i+1).padStart(2,'0')}</span>
                      <div>
                        <div style={{fontFamily:'monospace', fontSize:13, fontWeight:'bold', color:'#ede8d8', marginBottom:4}}>{dont.t}</div>
                        <div style={{fontFamily:'monospace', fontSize:11, color:'#8b8355', lineHeight:1.5}}>{dont.d}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── QUOTES TAB ─── */}
            {tab === 'quotes' && (
              <div>
                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:3, marginBottom:16, textAlign:'center'}}>FIRE QUOTES — MENTAL AMMUNITION</div>
                {QUOTES.map((q, i) => (
                  <div key={i} style={{
                    background: q.fire ? '#120a09' : '#111210',
                    border: `1px solid ${q.fire ? '#4a1a10' : '#1e2018'}`,
                    borderRadius:8,
                    padding:'14px 16px',
                    marginBottom:10,
                  }}>
                    <p style={{fontFamily:'monospace', fontSize:13, fontStyle:'italic', color: q.fire ? '#ede8d8' : '#c8c0a8', lineHeight:1.7, margin:'0 0 8px'}}>
                      &ldquo;{q.t}&rdquo;
                    </p>
                    <div style={{fontFamily:'monospace', fontSize:10, color: q.fire ? '#d94025' : '#4a5240', letterSpacing:2}}>
                      — {q.a}
                    </div>
                    {q.fire && <div style={{marginTop:6, fontSize:16}}>🔥</div>}
                  </div>
                ))}
              </div>
            )}

            {/* ─── CAL TAB ─── */}
            {tab === 'cal' && (
              <div>
                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:3, marginBottom:16, textAlign:'center'}}>30-DAY MISSION MAP</div>

                {/* Week nav */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
                  <button
                    onClick={() => setCalWeek(w => Math.max(0, w-1))}
                    disabled={calWeek === 0}
                    style={{background:'#1a1b16', border:'1px solid #3a4032', borderRadius:4, padding:'6px 14px', fontFamily:'monospace', fontSize:11, color: calWeek === 0 ? '#3a4032' : '#8b8355', cursor: calWeek === 0 ? 'default' : 'pointer'}}
                  >
                    ← PREV
                  </button>
                  <span style={{fontFamily:'monospace', fontSize:11, color:'#c9941a', fontWeight:'bold'}}>
                    WEEK {calWeek + 1} — DAYS {calStart}–{Math.min(calStart+6, 30)}
                  </span>
                  <button
                    onClick={() => setCalWeek(w => Math.min(3, w+1))}
                    disabled={calWeek === 3}
                    style={{background:'#1a1b16', border:'1px solid #3a4032', borderRadius:4, padding:'6px 14px', fontFamily:'monospace', fontSize:11, color: calWeek === 3 ? '#3a4032' : '#8b8355', cursor: calWeek === 3 ? 'default' : 'pointer'}}
                  >
                    NEXT →
                  </button>
                </div>

                {/* Day grid */}
                <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:20}}>
                  {calDays.map(d => {
                    const prog = PROGRAM.find(p => p.day === d);
                    const isDone = completed[String(d)] && completed[String(d)].length > 0;
                    const isCurrent = d === currentDay;
                    const isFuture = d > currentDay;
                    const isRest = prog?.rest;
                    return (
                      <div
                        key={d}
                        style={{
                          background: isDone ? '#0d1a0f' : isRest ? '#0f100c' : isFuture ? '#0a0b08' : '#111210',
                          border: `1px solid ${isCurrent ? '#d94025' : isDone ? '#2d6b4a' : isRest ? '#1e2018' : '#1a1b16'}`,
                          borderRadius:6,
                          padding:'8px 4px',
                          textAlign:'center',
                          cursor:'default',
                        }}
                      >
                        <div style={{fontFamily:'monospace', fontSize:9, color:'#4a5240', marginBottom:3}}>DAY</div>
                        <div style={{fontFamily:'monospace', fontSize:16, fontWeight:'bold', color: isCurrent ? '#d94025' : isDone ? '#3d8b60' : isFuture ? '#2a2b20' : '#8b8355'}}>
                          {d}
                        </div>
                        <div style={{fontSize:10, marginTop:3}}>
                          {isDone ? '✓' : isRest ? '💤' : isCurrent ? '●' : isFuture ? '' : '○'}
                        </div>
                        {isRest && <div style={{fontFamily:'monospace', fontSize:7, color:'#3a4032', marginTop:2}}>REST</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Quick day preview */}
                {calDays.map(d => {
                  const prog = PROGRAM.find(p => p.day === d);
                  if (!prog || prog.rest || !('ex' in prog)) return null;
                  if (d !== currentDay) return null;
                  return (
                    <div key={d} style={{background:'#111210', border:'1px solid #1e2018', borderRadius:6, padding:12}}>
                      <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:2, marginBottom:8}}>TODAY — DAY {d}: {prog.name}</div>
                      {(prog.ex as readonly {nm:string;r:number;u:string}[]).map((ex, ei) => (
                        <div key={ei} style={{display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid #1a1b16'}}>
                          <span style={{fontFamily:'monospace', fontSize:11, color:'#ede8d8'}}>{ex.nm}</span>
                          <span style={{fontFamily:'monospace', fontSize:11, color:'#c9941a'}}>{ex.r}× {ex.u}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── RECORDS TAB ─── */}
            {tab === 'records' && (
              <div>
                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:3, marginBottom:16, textAlign:'center'}}>PERSONAL RECORDS</div>

                {/* Overall stats */}
                <div style={{background:'#111210', border:'1px solid #1e2018', borderRadius:8, padding:14, marginBottom:16}}>
                  <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:2, marginBottom:10}}>OVERALL STATS</div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                    {[
                      {l:'Days Completed', v:totalDone},
                      {l:'Current Streak', v:`${streak} days`},
                      {l:'Current Day', v:`${currentDay} / 30`},
                      {l:'Total Sets Done', v:`${totalReps} sets`},
                    ].map((stat, i) => (
                      <div key={i} style={{background:'#0f100c', borderRadius:4, padding:'8px 10px'}}>
                        <div style={{fontFamily:'monospace', fontSize:9, color:'#3a4032', marginBottom:2}}>{stat.l}</div>
                        <div style={{fontFamily:'monospace', fontSize:16, fontWeight:'bold', color:'#c9941a'}}>{stat.v}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PR entries */}
                <div style={{fontFamily:'monospace', fontSize:10, color:'#4a5240', letterSpacing:2, marginBottom:10}}>YOUR PERSONAL BESTS</div>
                {PR_EXERCISES.map(exName => (
                  <div key={exName} style={{background:'#111210', border:'1px solid #1e2018', borderRadius:6, padding:'10px 14px', marginBottom:8, display:'flex', alignItems:'center', gap:10}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#ede8d8', marginBottom:4}}>{exName}</div>
                      <input
                        type="text"
                        value={prs[exName] || ''}
                        onChange={e => setPrs(prev => ({ ...prev, [exName]: e.target.value }))}
                        placeholder="e.g. 2:30, 25 reps, 45 sec..."
                        style={{
                          width:'100%',
                          background:'#0c0d0a',
                          border:'1px solid #2a2b20',
                          borderRadius:4,
                          padding:'6px 10px',
                          fontFamily:'monospace',
                          fontSize:12,
                          color:'#c9941a',
                          outline:'none',
                          boxSizing:'border-box',
                        }}
                      />
                    </div>
                    <span style={{fontSize:16, flexShrink:0}}>🏆</span>
                  </div>
                ))}

                <div style={{textAlign:'center', marginTop:12}}>
                  <div style={{fontFamily:'monospace', fontSize:10, color:'#2d6b4a'}}>✓ Records save automatically</div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RESET MODAL */}
        {showReset && (
          <div style={{position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20}}>
            <div style={{background:'#111210', border:'1px solid #d94025', borderRadius:10, padding:28, maxWidth:340, width:'100%', textAlign:'center'}}>
              <div style={{fontSize:32, marginBottom:10}}>⚠️</div>
              <div style={{fontFamily:'monospace', fontSize:16, fontWeight:'bold', color:'#d94025', marginBottom:8}}>RESET ALL PROGRESS?</div>
              <div style={{fontFamily:'monospace', fontSize:11, color:'#8b8355', marginBottom:20, lineHeight:1.6}}>
                This will delete all completed days, streak, notes, and personal records. This cannot be undone.
              </div>
              <div style={{display:'flex', gap:10}}>
                <button
                  onClick={() => setShowReset(false)}
                  style={{flex:1, background:'#1a1b16', border:'1px solid #3a4032', borderRadius:6, padding:'10px', fontFamily:'monospace', fontSize:12, color:'#8b8355', cursor:'pointer'}}
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmReset}
                  style={{flex:1, background:'#b5341e', border:'none', borderRadius:6, padding:'10px', fontFamily:'monospace', fontSize:12, fontWeight:'bold', color:'#fff', cursor:'pointer'}}
                >
                  RESET
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 pb-16">
          <ToolFAQ faqs={[
            {
              q: 'Is the Iron Core Workout tracker free?',
              a: 'Yes, 100% free. No account, no subscription, and no ads — just the 30-day calisthenics program.',
            },
            {
              q: 'What is the Iron Core Workout program?',
              a: 'Iron Core is a 30-day progressive calisthenics program focused on core strength. It progresses through two phases, starting with foundational moves like plank holds, hollow body, and leg raises, then advancing to side planks, flutter kicks, L-sit progressions, and harder core challenges. Rest days are built in to aid recovery.',
            },
            {
              q: 'Is my workout progress saved?',
              a: 'Yes. Progress is saved automatically in your browser\'s localStorage, so your completed days, streak, and personal records persist between visits on the same device. No data is sent to any server.',
            },
            {
              q: 'Do I need any equipment?',
              a: 'No equipment is needed. All exercises are bodyweight-only and can be done on any flat surface. A yoga mat is helpful for comfort.',
            },
            {
              q: 'How does this compare to paid fitness apps?',
              a: 'Apps like Nike Training Club or Freeletics charge subscriptions and track your data in the cloud. This tool is completely free, private, and browser-based — ideal for anyone who wants a structured core program without signing up for anything.',
            },
          ]} />
          <ToolSEOContent toolSlug="iron-core-workout" />
        </div>
      </main>
      <Footer />
    </>
  );
}
