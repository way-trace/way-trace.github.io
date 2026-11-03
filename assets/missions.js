// Missions, moments and numbers. Real-world stats: waytrace_overleaf/data/exp5_realworld_v2.json; simulation numbers:
// paper Q1/Q2 (sections/05_results.tex). Chapter times are seconds of the render timeline (field_video.py).
// assets/video/*.mp4 are the blurred *_share renders (git-ignored, tools/anonymize_clips.py --renders).
(() => {
const S = window.SITE;

S.abstract = "Web maps provide walking directions for nearly every city, but following them reliably over long " +
  "routes remains challenging for robots. Point-goal navigation policies rely heavily on accurate GNSS, while most " +
  "vision-language navigation models struggle to execute even short instructions outdoors. We present WayTrace, a " +
  "hierarchy that connects web-map directions to robot motion through language. An off-the-shelf orchestrator " +
  "vision-language model reads the turn-by-turn directions, a satellite map and recent camera images, and issues one " +
  "atomic command at a time, such as “cross the road to the left”. An onboard trace predictor, trained on " +
  "over one million auto-labelled street-level images, draws the path for this command in the image, and a " +
  "reinforcement learning policy tracks it. In long-range simulated missions, WayTrace remains robust to GNSS noise " +
  "and rarely leaves crosswalks or sidewalks, while point-goal baselines degrade sharply with about ten times more " +
  "violations. Deployed on a wheeled-legged robot, WayTrace completes real-world missions of up to 1.37 km at about " +
  "1.1 m/s through a busy city centre, rural trails and a university campus, handling crosswalks, staircases and " +
  "construction sites.";

S.missions = [
  { id: "starbucks", name: "Starbucks", area: "City centre · stairs, construction, tram tracks",
    dist: "426 m", speed: "1.12 m/s", cmds: 26, interventions: 0,
    video: "assets/video/central_starbucks.mp4", poster: "assets/clips/card_starbucks.jpg",
    clip: "assets/clips/card_starbucks.mp4",
    chapters: [
      { t: 0, kind: "manoeuvre", label: "Request and route planning" },
      { t: 12.2, kind: "manoeuvre", label: "Setting off" },
      { t: 19.7, kind: "crossing", label: "Zebra crossing", note: "an earlier zebra than planned" },
      { t: 31.5, kind: "manoeuvre", label: "Left at the intersection" },
      { t: 32.8, kind: "manoeuvre", label: "Around an e-scooter on the pavement" },
      { t: 50.1, kind: "manoeuvre", label: "Along the scaffolding" },
      { t: 67.1, kind: "manoeuvre", label: "Construction gap", note: "between barrier and wall" },
      { t: 89.3, kind: "manoeuvre", label: "Down two flights of stairs" },
      { t: 118.1, kind: "crossing", label: "Crossing at Central", note: "tram tracks and zebra crossing" },
      { t: 121.6, kind: "stop", label: "Quick safety stop for a tram" },
      { t: 141.1, kind: "arrival", label: "Arrival" },
    ] },
  { id: "snipes", name: "Snipes", area: "Old town · pedestrian streets, GNSS drift",
    dist: "248 m", speed: "1.01 m/s", cmds: 13, interventions: 0,
    video: "assets/video/niederdorf_snipes.mp4", poster: "assets/clips/card_snipes.jpg",
    clip: "assets/clips/card_snipes.mp4",
    chapters: [
      { t: 0, kind: "manoeuvre", label: "Request and route planning" },
      { t: 12.2, kind: "manoeuvre", label: "Through the construction site" },
      { t: 15.7, kind: "manoeuvre", label: "Left onto the road" },
      { t: 30.4, kind: "manoeuvre", label: "Left into the pedestrian street" },
      { t: 40.1, kind: "manoeuvre", label: "Busy street with café tables" },
      { t: 65.8, kind: "stop", label: "GNSS drift up to 12.7 m off the route" },
      { t: 79.8, kind: "crossing", label: "Zebra crossing despite the drift" },
      { t: 92.3, kind: "manoeuvre", label: "Between the barriers" },
      { t: 98.8, kind: "arrival", label: "Arrival" },
    ] },
  { id: "dieci", name: "Dieci", area: "River · footbridge, tram tracks, crowds",
    dist: "312 m", speed: "1.11 m/s", cmds: 19, interventions: 0,
    video: "assets/video/niederdorf_dieci.mp4", poster: "assets/clips/card_dieci.jpg",
    clip: "assets/clips/card_dieci.mp4",
    chapters: [
      { t: 0, kind: "manoeuvre", label: "Request and route planning" },
      { t: 12.2, kind: "crossing", label: "First zebra crossing" },
      { t: 29.3, kind: "manoeuvre", label: "Onto the Limmat footbridge" },
      { t: 53.8, kind: "crossing", label: "Across the tram tracks" },
      { t: 24.8, kind: "manoeuvre", label: "Right at the corner" },
      { t: 70.9, kind: "manoeuvre", label: "Right into the pedestrian street" },
      { t: 89.7, kind: "manoeuvre", label: "Pedestrians and a stroller" },
      { t: 99.4, kind: "arrival", label: "Arrival" },
    ] },
  { id: "mendokoro", name: "Mendokoro", area: "Fields, woods and campus · 1.37 km",
    dist: "1368 m", speed: "1.19 m/s", cmds: 21, interventions: 2,
    video: "assets/video/hoengg_mendokoro.mp4", poster: "assets/clips/card_mendokoro.jpg",
    clip: "assets/clips/card_mendokoro.mp4",
    chapters: [
      { t: 0, kind: "manoeuvre", label: "Request and route planning" },
      { t: 12.8, kind: "manoeuvre", label: "Setting off from the parking" },
      { t: 38.2, kind: "manoeuvre", label: "Right onto the field path" },
      { t: 134.0, kind: "manoeuvre", label: "Left into the woods" },
      { t: 167.8, kind: "manoeuvre", label: "Left fork" },
      { t: 193.7, kind: "crossing", label: "Crossing of field paths" },
      { t: 218.3, kind: "manoeuvre", label: "Right towards the campus" },
      { t: 234.3, kind: "override", label: "Operator override 1", note: "the turn command came 8 to 10 m early" },
      { t: 270.7, kind: "manoeuvre", label: "Plaza and ramp" },
      { t: 277.7, kind: "override", label: "Operator override 2", note: "the turn command stayed after the turn" },
      { t: 288.7, kind: "manoeuvre", label: "Two left turns" },
      { t: 308.3, kind: "arrival", label: "Arrival" },
    ] },
];

const C = n => ({ clip: `assets/clips/${n}.mp4`, poster: `assets/clips/${n}.jpg` });
// cat groups the moments for the filter chips, cmd is the orchestrator command logged in that window
S.categories = [["turns", "Turns"], ["crossings", "Crossings"], ["construction", "Construction & obstacles"],
  ["following", "Sidewalks & paths"], ["arrivals", "Approach & arrival"], ["failures", "Interventions"]];
S.moments = [
  { ...C("sb_turn_left"), cat: "turns", kind: "manoeuvre", title: "Left at the intersection", text: "Starbucks, city centre.", cmd: "Turn left at the intersection" },
  { ...C("sn_left_road"), cat: "turns", kind: "manoeuvre", title: "Left onto the road", text: "Snipes, right after the construction site.", cmd: "Turn left at the intersection" },
  { ...C("sn_left_pedestrian"), cat: "turns", kind: "manoeuvre", title: "Left into the pedestrian street", text: "Snipes, old town.", cmd: "Turn left at the intersection" },
  { ...C("di_right_corner"), cat: "turns", kind: "manoeuvre", title: "Right at the corner", text: "Dieci, after the first crossing.", cmd: "Turn right at the corner" },
  { ...C("di_right_junction"), cat: "turns", kind: "manoeuvre", title: "Right into the pedestrian street", text: "Dieci, old town.", cmd: "Turn right at the junction" },
  { ...C("me_forest_turn"), cat: "turns", kind: "manoeuvre", title: "Left into the woods", text: "Mendokoro, forest junction.", cmd: "Turn left at the junction" },
  { ...C("me_fork"), cat: "turns", kind: "manoeuvre", title: "Left fork in the forest", text: "Mendokoro.", cmd: "Take the left fork" },
  { ...C("me_left_junctions"), cat: "turns", kind: "manoeuvre", title: "Two left turns after the plaza", text: "Mendokoro, campus.", cmd: "Turn left at the junction" },
  { ...C("sb_first_crossing"), cat: "crossings", kind: "crossing", title: "First zebra crossing", text: "Starbucks, an earlier zebra than planned.", cmd: "Go left onto the crosswalk to the far end kerb" },
  { ...C("di_first_zebra"), cat: "crossings", kind: "crossing", title: "Zebra crossing at the start", text: "Dieci.", cmd: "Cross the road" },
  { ...C("di_tram"), cat: "crossings", kind: "crossing", title: "Across the tram tracks", text: "Dieci.", cmd: "Cross the road" },
  { ...C("sn_drift"), cat: "crossings", kind: "crossing", title: "Zebra crossing under GNSS drift", text: "Snipes, GNSS up to 12.7 m off the route.", cmd: "Go straight onto the crosswalk to the far end kerb" },
  { ...C("sb_tramstop"), cat: "crossings", kind: "stop", title: "Crossing at Central", text: "Starbucks, with a quick safety stop for a tram.", cmd: "Go left onto the crosswalk to the far end kerb" },
  { ...C("me_path_crossing"), cat: "crossings", kind: "crossing", title: "Straight through a path crossing", text: "Mendokoro, fields.", cmd: "Continue straight through the intersection" },
  { ...C("sn_construction"), cat: "construction", kind: "manoeuvre", title: "Through a construction site", text: "Snipes, at the start.", cmd: "Continue along the sidewalk" },
  { ...C("sb_escooter"), cat: "construction", kind: "manoeuvre", title: "Around an e-scooter", text: "Starbucks, onto the road and back onto the sidewalk.", cmd: "Keep right of the building and continue along the sidewalk" },
  { ...C("sb_scaffold"), cat: "construction", kind: "manoeuvre", title: "Along the scaffolding", text: "Starbucks.", cmd: "Keep right of the road and continue along the sidewalk" },
  { ...C("sb_construction"), cat: "construction", kind: "manoeuvre", title: "Through a construction gap", text: "Starbucks, between barrier and wall.", cmd: "Continue along the sidewalk" },
  { ...C("sn_barriers"), cat: "construction", kind: "manoeuvre", title: "Between the barriers", text: "Snipes, before the arrival.", cmd: "Continue along the pedestrian street" },
  { ...C("sb_stairs"), cat: "construction", kind: "manoeuvre", title: "Down two flights of stairs", text: "Starbucks.", cmd: "Go right onto the stairs" },
  { ...C("sb_sidewalk"), cat: "following", kind: "manoeuvre", title: "Following the sidewalk", text: "Starbucks, city centre.", cmd: "Continue along the sidewalk" },
  { ...C("sn_busy_street"), cat: "following", kind: "manoeuvre", title: "Busy street with café tables", text: "Snipes, old town.", cmd: "Continue along the pedestrian street" },
  { ...C("di_footbridge"), cat: "following", kind: "manoeuvre", title: "Onto the footbridge", text: "Dieci, across the Limmat.", cmd: "Continue along the bridge" },
  { ...C("di_bridge_crowd"), cat: "following", kind: "manoeuvre", title: "Through the crowd on the bridge", text: "Dieci.", cmd: "Continue along the bridge" },
  { ...C("me_field_path"), cat: "following", kind: "manoeuvre", title: "Along the field path", text: "Mendokoro, rural trail.", cmd: "Continue along the path" },
  { ...C("me_plaza_ramp"), cat: "following", kind: "manoeuvre", title: "Plaza and ramp", text: "Mendokoro, campus.", cmd: "Continue straight along the path" },
  { ...C("sb_arrival"), cat: "arrivals", kind: "arrival", title: "Arrival at Starbucks", text: "After the crossing at Central.", cmd: "Go to the Starbucks" },
  { ...C("sn_arrival"), cat: "arrivals", kind: "arrival", title: "Arrival at Snipes", text: "Old town.", cmd: "Go to the Snipes" },
  { ...C("di_arrival"), cat: "arrivals", kind: "arrival", title: "Arrival at Dieci", text: "Past pedestrians and a stroller.", cmd: "Go to the Dieci icecream" },
  { ...C("me_arrival"), cat: "arrivals", kind: "arrival", title: "Arrival at Mendokoro", text: "After 1.37 km.", cmd: "Go to the coffee shop" },
  { ...C("me_override_campus"), cat: "failures", kind: "failure", title: "Turn command too early", text: "Mendokoro, campus entrance: the operator overrides the command.", cmd: "Turn left at the intersection" },
  { ...C("me_override_plaza"), cat: "failures", kind: "failure", title: "Turn command kept after the turn", text: "Mendokoro, open plaza: the operator overrides the command.", cmd: "Turn right at the junction" },
];

S.numbers = [
  { value: "83.3 %", label: "success over 10 missions (4.68 km) with perfect GNSS, VLN baselines at most 20 %" },
  { value: "63.3 %", label: "success at 7 m GNSS noise, point-goal baselines 23.3 % and 10.0 %" },
  { value: "≈10×", label: "fewer crosswalk violations than point-goal baselines" },
  { value: "1.37 km", label: "longest real-world mission, at 1.19 m/s" },
];

S.board = {
  cols: ["Method", "SR 0 m", "SR 2 m", "SR 5 m", "SR 7 m", "Crosswalk viol. 0 m", "Crosswalk viol. 7 m", "Road viol. 7 m"],
  higher: [true, true, true, true, false, false, false],
  maxv: [100, 100, 100, 100, 70, 70, 10],
  rows: [
    { name: "WayTrace (ours)", ours: true, vals: [83.3, 80.0, 73.3, 63.3, 2.2, 5.4, 0.9] },
    { name: "CityWalker + RL", vals: [36.7, 40.0, 20.0, 23.3, 54.8, 55.6, 8.0] },
    { name: "VAMOS + RL", vals: [63.3, 60.0, 16.7, 10.0, 31.8, 68.8, 9.6] },
  ],
};
})();
