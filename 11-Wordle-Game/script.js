(function () {
  "use strict";

  const LEVELS = {
    easy: { wordLength: 4, maxGuesses: 6, name: "Easy" },
    medium: { wordLength: 5, maxGuesses: 6, name: "Medium" },
    hard: { wordLength: 6, maxGuesses: 5, name: "Hard" },
    expert: { wordLength: 7, maxGuesses: 5, name: "Expert" },
  };

  // Word lists by length (all lowercase, no duplicates)
  const WORDS = {
    4: [
      "able", "back", "ball", "band", "bank", "base", "bear", "beat", "been", "best",
      "bird", "blue", "book", "both", "call", "calm", "came", "card", "care", "case",
      "cash", "cast", "city", "cold", "come", "cook", "cool", "dark", "data", "date",
      "dead", "dear", "deep", "door", "down", "draw", "drop", "each", "earl", "east",
      "easy", "edge", "else", "even", "ever", "face", "fact", "fair", "fall", "farm",
      "fast", "feel", "file", "fill", "film", "find", "fine", "fire", "fish", "five",
      "flat", "flow", "food", "foot", "form", "free", "from", "full", "game", "gave",
      "girl", "give", "gold", "gone", "good", "gray", "grow", "half", "hand", "hard",
      "have", "head", "hear", "heat", "help", "here", "high", "hold", "home", "hope",
      "hour", "idea", "into", "just", "keep", "kind", "king", "know", "land", "last",
      "late", "lead", "left", "life", "line", "list", "live", "long", "look", "love",
      "main", "make", "many", "mark", "mayb", "mean", "meet", "mind", "miss", "more",
      "most", "move", "much", "must", "name", "need", "next", "none", "only", "open",
      "over", "part", "pass", "past", "plan", "play", "poor", "pull", "push", "read",
      "real", "rest", "rich", "right", "room", "rule", "same", "save", "seat", "seen",
      "sell", "send", "ship", "shop", "show", "side", "sign", "site", "size", "some",
      "sort", "stay", "step", "stop", "such", "take", "talk", "team", "tell", "term",
      "than", "that", "them", "then", "they", "this", "time", "town", "tree", "true",
      "turn", "type", "unit", "upon", "very", "want", "ward", "warm", "week", "well",
      "went", "were", "what", "when", "will", "wind", "with", "word", "work", "year",
    ],
    5: [
      "about", "above", "after", "again", "allow", "alone", "along", "among", "anger", "angle",
      "apple", "apply", "arena", "argue", "arise", "array", "asset", "audio", "avoid", "award",
      "badly", "basic", "basis", "beach", "begin", "being", "below", "bench", "birth", "black",
      "blame", "blank", "blast", "block", "blood", "board", "boost", "brain", "brand", "brave",
      "bread", "break", "bridge", "brief", "bring", "broad", "brown", "build", "burst", "buyer",
      "cable", "calm", "candy", "carry", "catch", "cause", "chain", "chair", "chart", "cheap",
      "check", "chest", "chief", "child", "claim", "class", "clean", "clear", "climb", "clock",
      "close", "cloud", "coach", "coast", "color", "could", "count", "court", "cover", "craft",
      "crash", "cream", "crime", "cross", "curve", "dance", "death", "delay", "delta", "dirty",
      "doubt", "dozen", "draft", "drama", "drawn", "dream", "dress", "drink", "drive", "eager",
      "early", "earth", "eight", "empty", "enemy", "enjoy", "enter", "equal", "error", "event",
      "every", "exact", "exist", "extra", "faith", "false", "fault", "field", "fifth", "fight",
      "final", "first", "fixed", "flash", "floor", "fluid", "focus", "force", "forth", "frame",
      "fresh", "front", "fruit", "fully", "funny", "giant", "given", "glass", "globe", "grace",
      "grade", "grain", "grand", "grant", "grass", "great", "green", "gross", "group", "grown",
      "guard", "guess", "guest", "guide", "happy", "heart", "heavy", "hello", "horse", "hotel",
      "house", "human", "ideal", "image", "index", "inner", "input", "issue", "joint", "judge",
      "juice", "knife", "known", "label", "large", "later", "laugh", "layer", "learn", "least",
      "leave", "legal", "level", "light", "limit", "local", "logic", "loose", "lunch", "major",
      "maker", "march", "match", "maybe", "metal", "meter", "might", "minor", "minus", "mixed",
      "model", "money", "month", "moral", "motor", "mouth", "movie", "music", "never", "night",
      "noise", "north", "novel", "nurse", "occur", "ocean", "offer", "often", "order", "other",
      "ought", "outer", "owner", "panel", "paper", "party", "peace", "phase", "phone", "photo",
      "piece", "pilot", "pitch", "place", "plain", "plane", "plant", "plate", "point", "pound",
      "power", "press", "price", "prime", "print", "prior", "prize", "proof", "proud", "prove",
      "quick", "quiet", "quite", "quote", "radio", "raise", "range", "rapid", "ratio", "reach",
      "ready", "refer", "right", "river", "round", "route", "royal", "rural", "scale", "scene",
      "scope", "score", "sense", "serve", "seven", "shall", "shape", "share", "sharp", "sheet",
      "shelf", "shell", "shift", "shine", "shoot", "short", "shown", "sight", "since", "skill",
      "sleep", "slide", "small", "smart", "smile", "smith", "solid", "solve", "sorry", "sound",
      "south", "space", "speak", "speed", "spend", "split", "spoke", "sport", "staff", "stage",
      "stake", "stand", "start", "state", "steam", "steel", "stick", "still", "stock", "stone",
      "store", "storm", "story", "strip", "study", "stuff", "style", "sugar", "suite", "super",
      "sweet", "table", "taken", "taste", "teach", "teeth", "thank", "their", "theme", "there",
      "these", "thick", "thing", "think", "third", "those", "three", "throw", "tight", "title",
      "today", "total", "touch", "tough", "track", "trade", "train", "treat", "trend", "trial",
      "tribe", "trick", "truly", "trust", "truth", "twice", "under", "union", "until", "upper",
      "urban", "usual", "valid", "value", "video", "virus", "visit", "vital", "voice", "waste",
      "watch", "water", "wheel", "where", "which", "while", "white", "whole", "whose", "woman",
      "world", "worry", "worse", "worth", "would", "write", "wrong", "young", "youth",
    ],
    6: [
      "action", "actual", "advice", "affect", "afford", "afraid", "agency", "agenda", "almost", "always",
      "amount", "animal", "annual", "answer", "anyone", "around", "artist", "assess", "assist", "assume",
      "attack", "attend", "author", "battle", "beauty", "become", "before", "behind", "belief", "belong",
      "better", "beyond", "branch", "bridge", "budget", "burden", "button", "camera", "career", "center",
      "chance", "change", "charge", "choice", "choose", "church", "client", "closed", "coffee", "column",
      "comedy", "commit", "common", "comply", "concept", "concern", "config", "confirm", "create",
      "credit", "crisis", "custom", "damage", "danger", "dealer", "debate", "decade", "decide", "defend",
      "define", "degree", "demand", "depend", "design", "detail", "device", "differ", "doctor", "double",
      "driver", "during", "easily", "editor", "effect", "effort", "either", "employ", "enable", "energy",
      "engine", "ensure", "entire", "escape", "except", "expand", "expect", "expert", "export", "extend",
      "factor", "family", "famous", "father", "figure", "finger", "finish", "flight", "follow", "forest",
      "forget", "formal", "format", "former", "foster", "friend", "future", "garden", "gather", "gender",
      "gently", "global", "ground", "growth", "handle", "happen", "health", "height", "highly", "honest",
      "impact", "import", "income", "indeed", "injury", "inside", "intend", "invest", "island", "itself",
      "junior", "knight", "laptop", "latest", "leader", "league", "length", "lesson", "letter", "likely",
      "living", "losing", "manage", "manner", "master", "matter", "medium", "member", "memory", "mental",
      "method", "middle", "minute", "modern", "moment", "mother", "motion", "moving", "murder", "museum",
      "nation", "native", "nature", "nobody", "normal", "notice", "number", "object", "office", "option",
      "origin", "outcome", "output", "parent", "people", "period", "person", "phrase", "planet", "player",
      "please", "plenty", "pocket", "policy", "pretty", "prince", "profit", "proper", "public", "purpose",
      "raised", "random", "rarely", "rather", "reason", "recall", "recent", "record", "reduce", "reform",
      "refuse", "regard", "region", "relate", "remain", "remote", "remove", "repeat", "report", "resort",
      "result", "return", "review", "reward", "safety", "sample", "scheme", "school", "screen", "script",
      "search", "second", "secret", "sector", "secure", "select", "senior", "series", "server", "settle",
      "shadow", "should", "silver", "simple", "single", "sister", "source", "speech", "spirit", "spread",
      "spring", "square", "stable", "status", "stream", "street", "stress", "strict", "stroke", "strong",
      "submit", "sudden", "summer", "supply", "survey", "switch", "symbol", "system", "target", "tennis",
      "thanks", "theory", "threat", "ticket", "timing", "toward", "travel", "treaty", "unique", "unless",
      "useful", "valley", "variety", "victim", "vision", "visual", "weight", "window", "winter", "wonder",
      "worker", "writer", "yellow",
    ],
    7: [
      "ability", "account", "address", "advance", "already", "another", "anxiety", "attempt", "average", "balance",
      "because", "believe", "benefit", "between", "brother", "capital", "central", "century", "certain", "chapter",
      "citizen", "clearly", "climate", "collect", "college", "comfort", "comment", "company", "compare", "concern",
      "conduct", "confirm", "connect", "consist", "contact", "contain", "content", "context", "control", "convert",
      "correct", "country", "couple", "course", "covered", "culture", "current", "dealing", "decided", "default",
      "defense", "defined", "degree", "demand", "depend", "design", "despite", "destroy", "develop", "discuss",
      "disease", "display", "dispute", "distant", "diverse", "economy", "edition", "element", "embrace", "emotion",
      "employ", "enable", "engaged", "enhance", "episode", "evening", "exactly", "example", "execute", "exercise",
      "expand", "expect", "explain", "express", "extract", "factory", "failure", "feature", "federal", "feeling",
      "fiction", "finally", "finance", "finding", "fitness", "foreign", "forever", "forward", "freedom", "further",
      "general", "growing", "handled", "happens", "healthy", "hearing", "heavily", "helpful", "history", "holiday",
      "however", "hundred", "husband", "illegal", "illness", "imagine", "improve", "include", "initial", "instead",
      "intense", "involve", "journal", "journey", "justice", "keeping", "killing", "leading", "learned", "leather",
      "limited", "machine", "manager", "married", "maximum", "meaning", "measure", "medical", "meeting", "mention",
      "message", "million", "minimum", "minutes", "missing", "mission", "mistake", "mixture", "monitor", "natural",
      "nothing", "nowhere", "nuclear", "obvious", "offered", "officer", "opening", "operate", "opinion", "organic",
      "outcome", "outside", "package", "partner", "passion", "patient", "pattern", "payment", "perfect", "perform",
      "perhaps", "physics", "picture", "plastic", "popular", "prepare", "present", "prevent", "primary", "privacy",
      "private", "problem", "process", "produce", "product", "profile", "program", "project", "promise", "promote",
      "protect", "provide", "purpose", "quality", "quarter", "quickly", "reading", "reality", "receive", "recently",
      "reflect", "regular", "related", "release", "replace", "request", "require", "research", "resolve", "respect",
      "respond", "retired", "revenue", "review", "running", "satisfy", "science", "section", "segment", "serious",
      "service", "session", "setting", "several", "shelter", "society", "someone", "speaker", "special", "species",
      "station", "storage", "strange", "stretch", "student", "subject", "success", "suggest", "support", "surface",
      "survive", "suspect", "sustain", "teacher", "tension", "theatre", "therapy", "thought", "through", "tonight",
      "totally", "towards", "traffic", "training", "travel", "treatment", "trouble", "typical", "uniform", "unknown",
      "unusual", "usually", "various", "vehicle", "version", "village", "violent", "virtual", "visible", "waiting",
      "warning", "weather", "website", "wedding", "weekend", "welcome", "western", "whether", "without", "working",
      "worried", "writing", "written",
    ],
  };

  const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];

  // Short generic hints per word (category/synonym). Fallback used if missing.
  const HINTS = {
    4: {
      able: "Capable", back: "Behind", ball: "Round toy", band: "Group", bank: "Money place", base: "Foundation", bear: "Animal", beat: "Win", been: "Past of be", best: "Top", bird: "Animal", blue: "Color", book: "Read", both: "The two", call: "Phone", calm: "Peaceful", came: "Arrived", card: "Greeting", care: "Attention", case: "Situation", cash: "Money", cast: "Actors", city: "Town", cold: "Chilly", come: "Arrive", cook: "Prepare food", cool: "Chilly", dark: "No light", data: "Info", date: "Day", dead: "Not alive", dear: "Beloved", deep: "Far down", door: "Entry", down: "Below", draw: "Sketch", drop: "Fall", each: "Every", earl: "Noble", east: "Direction", easy: "Simple", edge: "Border", else: "Other", even: "Equal", ever: "Always", face: "Front", fact: "Truth", fair: "Just", fall: "Drop", farm: "Land", fast: "Quick", feel: "Touch", file: "Document", fill: "Occupy", film: "Movie", find: "Discover", fine: "Okay", fire: "Flames", fish: "Animal", five: "Number", flat: "Level", flow: "Move", food: "Eat", foot: "Body part", form: "Shape", free: "No cost", from: "Origin", full: "Complete", game: "Play", gave: "Donated", girl: "Female", give: "Donate", gold: "Metal", gone: "Left", good: "Nice", gray: "Color", grow: "Expand", half: "50%", hand: "Body part", hard: "Tough", have: "Own", head: "Body", hear: "Listen", heat: "Hot", help: "Assist", here: "This place", high: "Tall", hold: "Grasp", home: "House", hope: "Wish", hour: "60 min", idea: "Thought", into: "Inside", just: "Only", keep: "Retain", kind: "Nice", king: "Ruler", know: "Understand", land: "Ground", last: "Final", late: "Delayed", lead: "Guide", left: "Side", life: "Living", line: "Row", list: "Series", live: "Reside", long: "Lengthy", look: "See", love: "Adore", main: "Primary", make: "Create", many: "Lots", mark: "Sign", mayb: "Perhaps", mean: "Average", meet: "Encounter", mind: "Brain", miss: "Fail", more: "Extra", most: "Maximum", move: "Relocate", much: "A lot", must: "Have to", name: "Title", need: "Require", next: "Following", none: "Zero", only: "Just", open: "Unclosed", over: "Done", part: "Piece", pass: "Go", past: "Before", plan: "Scheme", play: "Game", poor: "Needy", pull: "Tug", push: "Shove", read: "Peruse", real: "True", rest: "Relax", rich: "Wealthy", right: "Correct", room: "Space", rule: "Law", same: "Identical", save: "Rescue", seat: "Chair", seen: "Viewed", sell: "Vend", send: "Mail", ship: "Boat", shop: "Store", show: "Display", side: "Edge", sign: "Symbol", site: "Place", size: "Dimension", some: "Few", sort: "Type", stay: "Remain", step: "Stride", stop: "Halt", such: "So", take: "Grab", talk: "Speak", team: "Group", tell: "Say", term: "Word", than: "Compared", that: "Which", them: "Those", then: "Next", they: "Them", this: "It", time: "Clock", town: "City", tree: "Plant", true: "Real", turn: "Rotate", type: "Kind", unit: "One", upon: "On", very: "Quite", want: "Desire", ward: "Zone", warm: "Hot", week: "7 days", well: "Good", went: "Go past", were: "Be past", what: "Which", when: "Time", will: "Shall", wind: "Breeze", with: "Plus", word: "Term", work: "Job", year: "12 months",
    },
    5: {
      about: "Regarding", above: "Over", after: "Following", again: "Once more", allow: "Permit", alone: "Solo", along: "With", among: "Between", anger: "Rage", angle: "Corner", apple: "Fruit", apply: "Use", arena: "Stadium", argue: "Debate", arise: "Occur", array: "List", asset: "Resource", audio: "Sound", avoid: "Skip", award: "Prize", badly: "Poorly", basic: "Simple", basis: "Base", beach: "Shore", begin: "Start", being: "Existing", below: "Under", bench: "Seat", birth: "Born", black: "Color", blame: "Fault", blank: "Empty", blast: "Explosion", block: "Cube", blood: "Red fluid", board: "Plank", boost: "Lift", brain: "Mind", brand: "Label", brave: "Courageous", bread: "Food", break: "Shatter", bridge: "Crossing", brief: "Short", bring: "Carry", broad: "Wide", brown: "Color", build: "Construct", burst: "Explode", buyer: "Customer", cable: "Wire", calm: "Peaceful", candy: "Sweet", carry: "Hold", catch: "Grab", cause: "Reason", chain: "Link", chair: "Seat", chart: "Graph", cheap: "Inexpensive", check: "Verify", chest: "Torso", chief: "Main", child: "Kid", claim: "Assert", class: "Grade", clean: "Tidy", clear: "Obvious", climb: "Ascend", clock: "Time", close: "Shut", cloud: "Sky", coach: "Trainer", coast: "Shore", color: "Hue", could: "Might", count: "Number", court: "Trial", cover: "Lid", craft: "Skill", crash: "Collide", cream: "Dairy", crime: "Illegal", cross: "Intersect", curve: "Bend", dance: "Move", death: "End", delay: "Wait", delta: "Change", dirty: "Unclean", doubt: "Uncertain", dozen: "Twelve", draft: "Rough", drama: "Play", drawn: "Pulled", dream: "Sleep", dress: "Clothes", drink: "Beverage", drive: "Steer", eager: "Keen", early: "Before", earth: "Planet", eight: "Number", empty: "Vacant", enemy: "Foe", enjoy: "Like", enter: "Go in", equal: "Same", error: "Mistake", event: "Occasion", every: "Each", exact: "Precise", exist: "Be", extra: "More", faith: "Belief", false: "Not true", fault: "Blame", field: "Area", fifth: "Number", fight: "Battle", final: "Last", first: "Initial", fixed: "Set", flash: "Burst", floor: "Ground", fluid: "Liquid", focus: "Concentrate", force: "Power", forth: "Forward", frame: "Border", fresh: "New", front: "Face", fruit: "Food", fully: "Completely", funny: "Amusing", giant: "Huge", given: "Granted", glass: "Cup", globe: "Earth", grace: "Elegance", grade: "Score", grain: "Seed", grand: "Great", grant: "Give", grass: "Lawn", great: "Big", green: "Color", gross: "Total", group: "Set", grown: "Matured", guard: "Protect", guess: "Estimate", guest: "Visitor", guide: "Lead", happy: "Glad", heart: "Organ", heavy: "Weighty", hello: "Greeting", horse: "Animal", hotel: "Lodging", house: "Home", human: "Person", ideal: "Perfect", image: "Picture", index: "List", inner: "Inside", input: "Data", issue: "Problem", joint: "Shared", judge: "Referee", juice: "Drink", knife: "Blade", known: "Famous", label: "Tag", large: "Big", later: "After", laugh: "Giggle", layer: "Level", learn: "Study", least: "Minimum", leave: "Go", legal: "Lawful", level: "Stage", light: "Lamp", limit: "Max", local: "Nearby", logic: "Reason", loose: "Free", lunch: "Meal", major: "Main", maker: "Creator", march: "Walk", match: "Game", maybe: "Perhaps", metal: "Material", meter: "Measure", might: "Could", minor: "Small", minus: "Less", mixed: "Blended", model: "Example", money: "Cash", month: "30 days", moral: "Ethical", motor: "Engine", mouth: "Lips", movie: "Film", music: "Songs", never: "Not ever", night: "Dark", noise: "Sound", north: "Direction", novel: "Book", nurse: "Care", occur: "Happen", ocean: "Sea", offer: "Propose", often: "Frequently", order: "Request", other: "Else", ought: "Should", outer: "External", owner: "Possessor", panel: "Board", paper: "Sheet", party: "Celebration", peace: "Calm", phase: "Stage", phone: "Call", photo: "Picture", piece: "Part", pilot: "Fly", pitch: "Throw", place: "Location", plain: "Simple", plane: "Aircraft", plant: "Grow", plate: "Dish", point: "Dot", pound: "Weight", power: "Force", press: "Push", price: "Cost", prime: "Best", print: "Copy", prior: "Before", prize: "Award", proof: "Evidence", proud: "Pride", prove: "Show", quick: "Fast", quiet: "Silent", quite: "Very", quote: "Cite", radio: "Broadcast", raise: "Lift", range: "Scope", rapid: "Fast", ratio: "Proportion", reach: "Arrive", ready: "Prepared", refer: "Mention", right: "Correct", river: "Stream", round: "Circle", route: "Path", royal: "King", rural: "Country", scale: "Size", scene: "View", scope: "Range", score: "Points", sense: "Feel", serve: "Help", seven: "Number", shall: "Will", shape: "Form", share: "Divide", sharp: "Pointed", sheet: "Layer", shelf: "Storage", shell: "Cover", shift: "Change", shine: "Gleam", shoot: "Fire", short: "Brief", shown: "Displayed", sight: "View", since: "Because", skill: "Ability", sleep: "Rest", slide: "Glide", small: "Tiny", smart: "Clever", smile: "Grin", smith: "Metal worker", solid: "Firm", solve: "Answer", sorry: "Apology", sound: "Noise", south: "Direction", space: "Room", speak: "Talk", speed: "Velocity", spend: "Use", split: "Divide", spoke: "Said", sport: "Game", staff: "Employees", stage: "Phase", stake: "Bet", stand: "Rise", start: "Begin", state: "Condition", steam: "Vapor", steel: "Metal", stick: "Rod", still: "Motionless", stock: "Supply", stone: "Rock", store: "Shop", storm: "Weather", story: "Tale", strip: "Remove", study: "Learn", stuff: "Things", style: "Fashion", sugar: "Sweet", suite: "Room set", super: "Great", sweet: "Sugar", table: "Furniture", taken: "Seized", taste: "Flavor", teach: "Instruct", teeth: "Molars", thank: "Grateful", their: "Belonging", theme: "Topic", there: "Place", these: "Those", thick: "Wide", thing: "Object", think: "Consider", third: "Number", those: "These", three: "Number", throw: "Toss", tight: "Firm", title: "Name", today: "Now", total: "Sum", touch: "Feel", tough: "Hard", track: "Path", trade: "Exchange", train: "Teach", treat: "Handle", trend: "Pattern", trial: "Test", tribe: "Group", trick: "Deceive", truly: "Really", trust: "Believe", truth: "Fact", twice: "Two times", under: "Below", union: "Group", until: "Till", upper: "Higher", urban: "City", usual: "Normal", valid: "Legal", value: "Worth", video: "Recording", virus: "Bug", visit: "Go to", vital: "Critical", voice: "Speech", waste: "Squander", watch: "See", water: "Liquid", wheel: "Circle", where: "Place", which: "What", while: "During", white: "Color", whole: "Entire", whose: "Belonging", woman: "Female", world: "Earth", worry: "Anxiety", worse: "Bad", worth: "Value", would: "Will", write: "Compose", wrong: "Incorrect", young: "Youth", youth: "Young",
    },
    6: {
      action: "Deed", actual: "Real", advice: "Tip", affect: "Impact", afford: "Pay for", afraid: "Scared", agency: "Bureau", agenda: "Plan", almost: "Nearly", always: "Forever", amount: "Quantity", animal: "Creature", annual: "Yearly", answer: "Reply", anyone: "Somebody", around: "About", artist: "Creator", assess: "Evaluate", assist: "Help", assume: "Suppose", attack: "Strike", attend: "Go to", author: "Writer", battle: "Fight", beauty: "Looks", become: "Turn into", before: "Prior", behind: "After", belief: "Faith", belong: "Fit in", better: "Improved", beyond: "Past", branch: "Limb", bridge: "Crossing", budget: "Funds", burden: "Load", button: "Click", camera: "Lens", career: "Job", center: "Middle", chance: "Luck", change: "Alter", charge: "Cost", choice: "Option", choose: "Pick", church: "Temple", client: "Customer", closed: "Shut", coffee: "Drink", column: "Pillar", comedy: "Humour", commit: "Pledge", common: "Usual", comply: "Obey", concept: "Idea", concern: "Worry", config: "Setup", confirm: "Verify", create: "Make", credit: "Trust", crisis: "Emergency", custom: "Habit", damage: "Harm", danger: "Risk", dealer: "Seller", debate: "Argue", decade: "Ten years", decide: "Choose", defend: "Protect", define: "Explain", degree: "Level", demand: "Ask", depend: "Rely", design: "Plan", detail: "Fact", device: "Gadget", differ: "Vary", doctor: "Physician", double: "Twice", driver: "Motorist", during: "While", easily: "Simply", editor: "Writer", effect: "Result", effort: "Try", either: "Or", employ: "Hire", enable: "Allow", energy: "Power", engine: "Motor", ensure: "Guarantee", entire: "Whole", escape: "Flee", except: "But", expand: "Grow", expect: "Anticipate", expert: "Pro", export: "Send", extend: "Stretch", factor: "Element", family: "Kin", famous: "Known", father: "Dad", figure: "Number", finger: "Digit", finish: "End", flight: "Trip", follow: "Track", forest: "Woods", forget: "Miss", formal: "Official", format: "Layout", former: "Previous", foster: "Nurture", friend: "Pal", future: "Later", garden: "Yard", gather: "Collect", gender: "Sex", gently: "Softly", global: "Worldwide", ground: "Earth", growth: "Rise", handle: "Grip", happen: "Occur", health: "Wellness", height: "Tallness", highly: "Very", honest: "Truthful", impact: "Effect", import: "Bring in", income: "Earnings", indeed: "Really", injury: "Harm", inside: "Within", intend: "Mean", invest: "Put in", island: "Land", itself: "Self", junior: "Younger", knight: "Warrior", laptop: "Computer", latest: "Newest", leader: "Boss", league: "Group", length: "Extent", lesson: "Class", letter: "Note", likely: "Probably", living: "Alive", losing: "Failing", manage: "Run", manner: "Way", master: "Expert", matter: "Issue", medium: "Middle", member: "Part", memory: "Recall", mental: "Mind", method: "Way", middle: "Center", minute: "Moment", modern: "Current", moment: "Instant", mother: "Mom", motion: "Movement", moving: "Shifting", murder: "Kill", museum: "Gallery", nation: "Country", native: "Local", nature: "World", nobody: "No one", normal: "Usual", notice: "See", number: "Figure", object: "Thing", office: "Work", option: "Choice", origin: "Source", outcome: "Result", output: "Yield", parent: "Mother or father", people: "Folks", period: "Time", person: "Individual", phrase: "Saying", planet: "World", player: "Gamer", please: "Kindly", plenty: "Lots", pocket: "Pouch", policy: "Rule", pretty: "Nice", prince: "Royal", profit: "Gain", proper: "Correct", public: "Open", purpose: "Aim", raised: "Lifted", random: "Chance", rarely: "Seldom", rather: "Instead", reason: "Cause", recall: "Remember", recent: "Latest", record: "Log", reduce: "Lessen", reform: "Change", refuse: "Decline", regard: "Consider", region: "Area", relate: "Connect", remain: "Stay", remote: "Distant", remove: "Take off", repeat: "Again", report: "Tell", resort: "Retreat", result: "Outcome", return: "Come back", review: "Check", reward: "Prize", safety: "Security", sample: "Example", scheme: "Plan", school: "Academy", screen: "Display", script: "Text", search: "Find", second: "Next", secret: "Hidden", sector: "Area", secure: "Safe", select: "Choose", senior: "Older", series: "Sequence", server: "Host", settle: "Resolve", shadow: "Shade", should: "Ought", silver: "Metal", simple: "Easy", single: "One", sister: "Sibling", source: "Origin", speech: "Talk", spirit: "Soul", spread: "Extend", spring: "Season", square: "Shape", stable: "Steady", status: "State", stream: "Flow", street: "Road", stress: "Pressure", strict: "Severe", stroke: "Hit", strong: "Powerful", submit: "Send", sudden: "Quick", summer: "Season", supply: "Provide", survey: "Poll", switch: "Change", symbol: "Sign", system: "Method", target: "Goal", tennis: "Sport", thanks: "Gratitude", theory: "Idea", threat: "Danger", ticket: "Pass", timing: "When", toward: "To", travel: "Trip", treaty: "Pact", unique: "Only", unless: "Except", useful: "Handy", valley: "Dale", variety: "Range", victim: "Sufferer", vision: "Sight", visual: "Seeing", weight: "Heaviness", window: "Pane", winter: "Cold season", wonder: "Marvel", worker: "Employee", writer: "Author", yellow: "Color",
    },
    7: {
      ability: "Skill", account: "Story", address: "Location", advance: "Progress", already: "Before", another: "Other", anxiety: "Worry", attempt: "Try", average: "Normal", balance: "Stability", because: "Since", believe: "Trust", benefit: "Advantage", between: "Among", brother: "Sibling", capital: "Funds", central: "Main", century: "100 years", certain: "Sure", chapter: "Section", citizen: "National", clearly: "Obviously", climate: "Weather", collect: "Gather", college: "School", comfort: "Ease", comment: "Remark", company: "Firm", compare: "Contrast", concern: "Worry", conduct: "Behaviour", confirm: "Verify", connect: "Link", consist: "Comprise", contact: "Reach", contain: "Hold", content: "Material", context: "Setting", control: "Power", convert: "Change", correct: "Right", country: "Nation", couple: "Pair", course: "Path", covered: "Hidden", culture: "Society", current: "Present", dealing: "Trading", decided: "Certain", default: "Standard", defense: "Protection", defined: "Set", degree: "Level", demand: "Request", depend: "Rely", design: "Plan", despite: "Although", destroy: "Ruin", develop: "Grow", discuss: "Talk", disease: "Illness", display: "Show", dispute: "Argument", distant: "Far", diverse: "Varied", economy: "Finance", edition: "Version", element: "Part", embrace: "Hug", emotion: "Feeling", employ: "Hire", enable: "Allow", engaged: "Busy", enhance: "Improve", episode: "Installment", evening: "Night", exactly: "Precisely", example: "Sample", execute: "Carry out", exercise: "Workout", expand: "Grow", expect: "Anticipate", explain: "Clarify", express: "State", extract: "Remove", factory: "Plant", failure: "Flop", feature: "Trait", federal: "National", feeling: "Emotion", fiction: "Story", finally: "At last", finance: "Money", finding: "Result", fitness: "Health", foreign: "Abroad", forever: "Always", forward: "Ahead", freedom: "Liberty", further: "More", general: "Overall", growing: "Increasing", handled: "Managed", happens: "Occurs", healthy: "Fit", hearing: "Ear", heavily: "Strongly", helpful: "Useful", history: "Past", holiday: "Vacation", however: "But", hundred: "100", husband: "Spouse", illegal: "Unlawful", illness: "Sickness", imagine: "Picture", improve: "Better", include: "Contain", initial: "First", instead: "Rather", intense: "Strong", involve: "Include", journal: "Diary", journey: "Trip", justice: "Fairness", keeping: "Holding", killing: "Murder", leading: "Main", learned: "Educated", leather: "Material", limited: "Restricted", machine: "Device", manager: "Boss", married: "Wed", maximum: "Most", meaning: "Sense", measure: "Size", medical: "Health", meeting: "Gathering", mention: "Refer", message: "Note", million: "1,000,000", minimum: "Least", minutes: "Time", missing: "Lost", mission: "Task", mistake: "Error", mixture: "Blend", monitor: "Screen", natural: "Normal", nothing: "Zero", nowhere: "No place", nuclear: "Atomic", obvious: "Clear", offered: "Given", officer: "Official", opening: "Start", operate: "Run", opinion: "View", organic: "Natural", outcome: "Result", outside: "Exterior", package: "Parcel", partner: "Mate", passion: "Desire", patient: "Sick person", pattern: "Design", payment: "Fee", perfect: "Flawless", perform: "Do", perhaps: "Maybe", physics: "Science", picture: "Image", plastic: "Material", popular: "Famous", prepare: "Ready", present: "Current", prevent: "Stop", primary: "Main", privacy: "Secrecy", private: "Personal", problem: "Issue", process: "Method", produce: "Make", product: "Item", profile: "Summary", program: "Plan", project: "Plan", promise: "Pledge", promote: "Advance", protect: "Guard", provide: "Supply", purpose: "Aim", quality: "Standard", quarter: "Fourth", quickly: "Fast", reading: "Books", reality: "Truth", receive: "Get", recently: "Lately", reflect: "Mirror", regular: "Normal", related: "Connected", release: "Free", replace: "Swap", request: "Ask", require: "Need", research: "Study", resolve: "Solve", respect: "Honour", respond: "Reply", retired: "Pensioned", revenue: "Income", review: "Check", running: "Jogging", satisfy: "Please", science: "Study", section: "Part", segment: "Part", serious: "Grave", service: "Help", session: "Meeting", setting: "Scene", several: "Some", shelter: "Refuge", society: "Community", someone: "Somebody", speaker: "Orator", special: "Unique", species: "Kind", station: "Stop", storage: "Space", strange: "Odd", stretch: "Extend", student: "Pupil", subject: "Topic", success: "Win", suggest: "Propose", support: "Back", surface: "Top", survive: "Live", suspect: "Doubt", sustain: "Maintain", teacher: "Instructor", tension: "Stress", theatre: "Stage", therapy: "Treatment", thought: "Idea", through: "Via", tonight: "This evening", totally: "Completely", towards: "To", traffic: "Cars", training: "Practice", travel: "Trip", treatment: "Care", trouble: "Problem", typical: "Normal", uniform: "Same", unknown: "Mystery", unusual: "Rare", usually: "Normally", various: "Several", vehicle: "Car", version: "Form", village: "Town", violent: "Fierce", virtual: "Digital", visible: "Obvious", waiting: "Standing by", warning: "Alert", weather: "Climate", website: "Site", wedding: "Marriage", weekend: "Saturday and Sunday", welcome: "Greeting", western: "Occidental", whether: "If", without: "Lacking", working: "Employed", worried: "Anxious", writing: "Text", written: "Penned",
    },
  };

  // Fill fallback for 6- and 7-letter: use first letter + " word" or "Common word"
  function getHint(word) {
    const len = word.length;
    const map = HINTS[len];
    if (map && map[word]) return map[word];
    return "Common word";
  }

  const levelScreen = document.getElementById("levelScreen");
  const gameScreen = document.getElementById("gameScreen");
  const boardEl = document.getElementById("board");
  const keyboardEl = document.getElementById("keyboard");
  const levelBadge = document.getElementById("levelBadge");
  const resultOverlay = document.getElementById("resultOverlay");
  const resultTitle = document.getElementById("resultTitle");
  const resultWord = document.getElementById("resultWord");
  const hintArea = document.getElementById("hintArea");
  const showHintsToggle = document.getElementById("showHintsToggle");
  const howToPlayOverlay = document.getElementById("howToPlayOverlay");
  const howToPlayClose = document.getElementById("howToPlayClose");

  let currentLevel = "medium";
  let wordLength = 5;
  let maxGuesses = 6;
  let targetWord = "";
  let guesses = [];
  let currentGuess = "";
  let gameOver = false;

  function getConfig() {
    const cfg = LEVELS[currentLevel];
    return { wordLength: cfg.wordLength, maxGuesses: cfg.maxGuesses, name: cfg.name };
  }

  function pickWord() {
    const list = WORDS[wordLength];
    return list[Math.floor(Math.random() * list.length)];
  }

  function isValidWord(word) {
    return WORDS[wordLength].indexOf(word.toLowerCase()) !== -1;
  }

  function getFeedback(guess, target) {
    const result = [];
    const g = guess.toLowerCase().split("");
    const t = target.toLowerCase().split("");
    const used = [];

    for (let i = 0; i < g.length; i++) {
      if (g[i] === t[i]) {
        result[i] = "correct";
        used[i] = true;
      }
    }
    for (let i = 0; i < g.length; i++) {
      if (result[i] === "correct") continue;
      let found = false;
      for (let j = 0; j < t.length; j++) {
        if (!used[j] && t[j] === g[i]) {
          used[j] = true;
          found = true;
          break;
        }
      }
      result[i] = found ? "present" : "absent";
    }
    return result;
  }

  function buildBoard() {
    const { wordLength: len, maxGuesses: max } = getConfig();
    boardEl.innerHTML = "";
    boardEl.className = "board size-" + len;
    for (let r = 0; r < max; r++) {
      const row = document.createElement("div");
      row.className = "board-row";
      for (let c = 0; c < len; c++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset.row = String(r);
        tile.dataset.col = String(c);
        row.appendChild(tile);
      }
      boardEl.appendChild(row);
    }
  }

  function buildKeyboard() {
    keyboardEl.innerHTML = "";
    const row2 = document.createElement("div");
    row2.className = "keyboard-row";
    ROWS[0].split("").forEach((k) => row2.appendChild(createKey(k)));
    keyboardEl.appendChild(row2);

    const row1 = document.createElement("div");
    row1.className = "keyboard-row";
    ROWS[1].split("").forEach((k) => row1.appendChild(createKey(k)));
    keyboardEl.appendChild(row1);

    const row0 = document.createElement("div");
    row0.className = "keyboard-row";
    const enter = createKey("Enter");
    enter.classList.add("wide");
    enter.textContent = "Enter";
    row0.appendChild(enter);
    ROWS[2].split("").forEach((k) => row0.appendChild(createKey(k)));
    const back = createKey("Backspace");
    back.classList.add("wide");
    back.textContent = "⌫";
    row0.appendChild(back);
    keyboardEl.appendChild(row0);
  }

  function createKey(key) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "key";
    btn.dataset.key = key;
    if (key.length === 1) btn.textContent = key;
    btn.addEventListener("click", () => handleKey(key));
    return btn;
  }

  function syncBoard() {
    const rows = boardEl.querySelectorAll(".board-row");
    const len = wordLength;
    guesses.forEach((guess, r) => {
      const feedback = getFeedback(guess, targetWord);
      const tiles = rows[r].querySelectorAll(".tile");
      guess.split("").forEach((letter, c) => {
        tiles[c].textContent = letter;
        tiles[c].classList.remove("filled", "correct", "present", "absent");
        tiles[c].classList.add("filled", feedback[c]);
      });
    });
    if (guesses.length < maxGuesses && currentGuess.length > 0) {
      const r = guesses.length;
      const tiles = rows[r].querySelectorAll(".tile");
      currentGuess.split("").forEach((letter, c) => {
        tiles[c].textContent = letter;
        tiles[c].classList.add("filled");
        tiles[c].classList.remove("correct", "present", "absent");
      });
      for (let c = currentGuess.length; c < len; c++) {
        tiles[c].textContent = "";
        tiles[c].classList.remove("filled", "correct", "present", "absent");
      }
    }
    updateKeyboardColors();
  }

  function updateKeyboardColors() {
    const keys = keyboardEl.querySelectorAll(".key[data-key]");
    const keyState = {};
    guesses.forEach((guess) => {
      const feedback = getFeedback(guess, targetWord);
      guess.split("").forEach((letter, i) => {
        const k = letter.toLowerCase();
        if (feedback[i] === "correct") keyState[k] = "correct";
        else if (feedback[i] === "present" && keyState[k] !== "correct") keyState[k] = "present";
        else if (feedback[i] === "absent" && !keyState[k]) keyState[k] = "absent";
      });
    });
    keys.forEach((btn) => {
      const k = btn.dataset.key.toLowerCase();
      if (k.length !== 1) return;
      btn.classList.remove("correct", "present", "absent");
      if (keyState[k]) btn.classList.add(keyState[k]);
    });
  }

  function showResult(won) {
    gameOver = true;
    resultTitle.textContent = won ? "You got it!" : "Game over";
    resultWord.textContent = targetWord.toUpperCase();
    resultOverlay.classList.remove("hidden");
  }

  function shakeRow(rowIndex) {
    const row = boardEl.querySelectorAll(".board-row")[rowIndex];
    const tiles = row.querySelectorAll(".tile");
    tiles.forEach((t) => t.classList.add("shake"));
    setTimeout(() => tiles.forEach((t) => t.classList.remove("shake")), 500);
  }

  function submitGuess() {
    if (currentGuess.length !== wordLength || gameOver) return;
    if (!isValidWord(currentGuess)) {
      shakeRow(guesses.length);
      return;
    }
    guesses.push(currentGuess);
    const won = currentGuess.toLowerCase() === targetWord.toLowerCase();
    currentGuess = "";
    syncBoard();
    if (won) {
      setTimeout(() => showResult(true), 500);
      return;
    }
    if (guesses.length >= maxGuesses) {
      setTimeout(() => showResult(false), 500);
    }
  }

  function handleKey(key) {
    if (gameOver) return;
    if (key === "Enter") {
      submitGuess();
      return;
    }
    if (key === "Backspace") {
      currentGuess = currentGuess.slice(0, -1);
      syncBoard();
      return;
    }
    if (key.length === 1 && /[a-zA-Z]/.test(key) && currentGuess.length < wordLength) {
      currentGuess += key.toLowerCase();
      syncBoard();
    }
  }

  function initGame() {
    const cfg = getConfig();
    wordLength = cfg.wordLength;
    maxGuesses = cfg.maxGuesses;
    targetWord = pickWord();
    guesses = [];
    currentGuess = "";
    gameOver = false;
    levelBadge.textContent = cfg.name;
    buildBoard();
    buildKeyboard();
    syncBoard();
    resultOverlay.classList.add("hidden");
    updateHintVisibility();
  }

  function updateHintVisibility() {
    if (showHintsToggle.checked) {
      hintArea.textContent = getHint(targetWord);
      hintArea.classList.remove("hidden");
    } else {
      hintArea.textContent = "";
      hintArea.classList.add("hidden");
    }
  }

  function openHowToPlay() {
    howToPlayOverlay.classList.remove("hidden");
    howToPlayOverlay.setAttribute("aria-hidden", "false");
  }

  function closeHowToPlay() {
    howToPlayOverlay.classList.add("hidden");
    howToPlayOverlay.setAttribute("aria-hidden", "true");
  }

  function showLevelScreen() {
    levelScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
  }

  function showGameScreen() {
    levelScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    initGame();
  }

  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentLevel = btn.dataset.level;
      showGameScreen();
    });
  });

  document.getElementById("changeLevelBtn").addEventListener("click", showLevelScreen);
  document.getElementById("newGameBtn").addEventListener("click", initGame);
  document.getElementById("playAgainBtn").addEventListener("click", initGame);
  document.getElementById("changeLevelFromResultBtn").addEventListener("click", () => {
    resultOverlay.classList.add("hidden");
    showLevelScreen();
  });

  showHintsToggle.addEventListener("change", updateHintVisibility);

  document.getElementById("howToPlayBtnLevel").addEventListener("click", openHowToPlay);
  document.getElementById("howToPlayBtnGame").addEventListener("click", openHowToPlay);
  howToPlayClose.addEventListener("click", closeHowToPlay);
  howToPlayOverlay.addEventListener("click", (e) => {
    if (e.target === howToPlayOverlay) closeHowToPlay();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !howToPlayOverlay.classList.contains("hidden")) closeHowToPlay();
  });

  document.addEventListener("keydown", (e) => {
    if (gameScreen.classList.contains("hidden")) return;
    if (!howToPlayOverlay.classList.contains("hidden")) return;
    if (e.key === "Backspace") e.preventDefault();
    handleKey(e.key);
  });

  buildKeyboard();
})();
