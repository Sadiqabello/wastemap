export interface RecyclingTip {
  id: string;
  icon: string;
  title: string;
  description: string;
  detail: string;
  category: "sorting" | "recycling" | "hazardous" | "composting" | "community";
}

export const RECYCLING_TIPS: RecyclingTip[] = [
  {
    id: "sort-waste",
    icon: "Trash2",
    title: "How to Sort Your Waste",
    description:
      "Learn the basics of household waste sorting to reduce landfill impact.",
    detail: `Proper waste sorting is the foundation of effective waste management. Here's how to do it right:

**Dry Waste (Recyclables)**
- Paper, cardboard, newspapers, magazines
- Plastic bottles and containers (rinse first)
- Glass bottles and jars
- Metal cans (aluminium and steel)

**Wet Waste (Organic)**
- Food scraps, fruit and vegetable peels
- Tea bags, coffee grounds
- Garden waste, leaves, flowers

**Non-Recyclable**
- Soiled paper and tissues
- Styrofoam packaging
- Broken ceramics and mirrors
- Diapers and sanitary products

**Tips for Success**
- Keep separate bins at home for each category
- Rinse containers before recycling
- Flatten cardboard boxes to save space
- When in doubt, check with your local waste authority`,
    category: "sorting",
  },
  {
    id: "what-recycle",
    icon: "Recycle",
    title: "What Can Be Recycled?",
    description:
      "A comprehensive guide to materials that can and cannot be recycled.",
    detail: `Understanding what's recyclable helps reduce contamination in recycling streams.

**Always Recyclable**
- Paper and cardboard (clean and dry)
- Aluminium cans and foil (clean)
- Steel/tin cans
- Glass bottles and jars
- PET (1) and HDPE (2) plastics

**Sometimes Recyclable (Check Locally)**
- Plastic bags (many supermarkets collect these)
- Tetra Paks / cartons
- Rigid plastics (toys, furniture)
- Clothing and textiles

**NOT Recyclable**
- Food-soiled paper (pizza boxes with grease)
- Plastic film and cling wrap
- Polystyrene/Styrofoam
- Ceramics and pottery
- Mirrors and window glass
- Nappies/diapers

**Remember:** When in doubt, leave it out! Contaminated recyclables can ruin entire batches.`,
    category: "recycling",
  },
  {
    id: "hazardous-waste",
    icon: "AlertTriangle",
    title: "Hazardous Waste Disposal",
    description:
      "Safe handling and disposal of e-waste, batteries, chemicals, and medical waste.",
    detail: `Hazardous waste requires special handling to protect people and the environment.

**Electronic Waste (E-Waste)**
- Old phones, computers, TVs, and peripherals
- Never throw in regular bins — they contain lead, mercury, and cadmium
- Take to certified e-waste recyclers or collection events
- Many manufacturers offer take-back programs

**Batteries**
- Car batteries: return to auto shops or recycling centres
- Household batteries: collect and take to designated drop-off points
- Never throw lithium batteries in regular waste (fire risk)

**Chemicals & Paint**
- Leftover paint: let dry completely, then dispose as solid waste
- Pesticides and cleaners: take to hazardous waste collection points
- Never pour chemicals down drains or into soil

**Medical Waste**
- Sharps (needles, syringes): use a sharps container, return to pharmacy
- Expired medications: return to pharmacies, never flush
- Used PPE: bag separately, dispose in general waste

**Motor Oil & Fluids**
- Collect in sealed containers
- Take to auto shops or recycling centres
- Never pour on ground or into drains`,
    category: "hazardous",
  },
  {
    id: "composting",
    icon: "Leaf",
    title: "Composting Basics",
    description:
      "Turn your organic waste into nutrient-rich compost for your garden.",
    detail: `Composting reduces landfill waste by up to 30% while creating free fertilizer.

**What to Compost (Greens — Nitrogen)**
- Fruit and vegetable scraps
- Coffee grounds and tea bags
- Fresh grass clippings
- Plant trimmings

**What to Compost (Browns — Carbon)**
- Dry leaves and twigs
- Shredded newspaper and cardboard
- Sawdust (untreated wood only)
- Straw and hay

**Do NOT Compost**
- Meat, fish, or dairy (attracts pests)
- Diseased plants
- Pet waste
- Treated or painted wood
- Cooking oils

**Getting Started**
1. Choose a shady spot in your yard
2. Start with a layer of browns (15-20cm)
3. Add greens, then alternate layers
4. Keep moist (like a wrung-out sponge)
5. Turn every 1-2 weeks for aeration
6. Ready in 2-6 months when dark and crumbly

**No Garden?** Try vermicomposting (worm composting) — works indoors in a small bin!`,
    category: "composting",
  },
  {
    id: "community-action",
    icon: "Users",
    title: "Community Action Guide",
    description:
      "How to organize a cleanup event and mobilize your community for action.",
    detail: `Community cleanups are powerful — they clean areas, build bonds, and raise awareness.

**Planning Your Cleanup**
1. **Choose a location** — Use WasteMapNaija reports to find hotspots
2. **Set a date and time** — Weekends work best, 2-3 hours is ideal
3. **Get permissions** — Contact local authorities if needed
4. **Recruit volunteers** — Share on social media, community boards, WhatsApp groups
5. **Create an event** — Use WasteMapNaija's Events feature to organize

**What You'll Need**
- Trash bags (separate for recyclables)
- Gloves (heavy-duty recommended)
- Grabbers/pickers (if available)
- First aid kit
- Water and snacks
- Hand sanitizer

**On the Day**
- Brief volunteers on safety (avoid sharp objects, hazardous materials)
- Assign teams to specific areas
- Take before photos for documentation
- Sort waste as you collect
- Take after photos — show the impact!

**After the Cleanup**
- Update report status on WasteMapNaija
- Upload before/after photos
- Share results on social media
- Thank your volunteers
- Plan the next one!

**Impact:** A single community cleanup can remove hundreds of kilos of waste and inspire lasting change.`,
    category: "community",
  },
  {
    id: "reduce-waste",
    icon: "ShoppingBag",
    title: "Reduce Your Daily Waste",
    description:
      "Simple lifestyle changes to minimize the waste you generate every day.",
    detail: `The best waste management starts with producing less waste in the first place.

**Shopping Habits**
- Bring reusable bags to the market and store
- Buy in bulk to reduce packaging
- Choose products with minimal packaging
- Avoid single-use plastics (straws, cups, cutlery)

**In the Kitchen**
- Plan meals to reduce food waste
- Store food properly to extend shelf life
- Use leftovers creatively
- Compost unavoidable food scraps

**At Work/School**
- Use a reusable water bottle
- Print double-sided or go paperless
- Use digital notes instead of paper
- Bring lunch in reusable containers

**Around the Home**
- Repair items instead of replacing
- Donate or sell items you no longer need
- Use rechargeable batteries
- Choose quality over quantity — it lasts longer

**The 5 R's (In Order)**
1. **Refuse** — Say no to what you don't need
2. **Reduce** — Use less of what you do need
3. **Reuse** — Find new purposes for items
4. **Recycle** — Process materials into new products
5. **Rot** — Compost organic waste`,
    category: "sorting",
  },
];

export const TIP_CATEGORIES = {
  sorting: { label: "Waste Sorting", color: "bg-blue-100 text-blue-700" },
  recycling: { label: "Recycling", color: "bg-green-100 text-green-700" },
  hazardous: { label: "Hazardous Waste", color: "bg-red-100 text-red-700" },
  composting: { label: "Composting", color: "bg-amber-100 text-amber-700" },
  community: { label: "Community", color: "bg-purple-100 text-purple-700" },
};
