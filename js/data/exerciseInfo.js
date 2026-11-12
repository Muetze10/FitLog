// ============================================================
// exerciseInfo.js – Kurzbeschreibungen für die Übungsbibliothek:
// Zielmuskeln, Ausführung und die wichtigsten Hinweise.
// Schlüssel = ID aus exercises.js (nur Startübungen).
// ============================================================

export const EXERCISE_INFO = {
  // ---------- Brust ----------
  "bankdruecken-lh": {
    focus: "Brust, Trizeps, vordere Schulter",
    execution: "Rücken flach auf der Bank, Füße fest am Boden, Schulterblätter zusammenziehen. Stange kontrolliert bis knapp über die Brust absenken, dann kraftvoll nach oben drücken, bis die Arme fast gestreckt sind.",
    tips: ["Ellenbogen ca. 45° zum Körper, nicht ausgestreckt", "Nicht von der Brust abprallen – kontrolliert absenken", "Hüfte bleibt auf der Bank"],
  },
  "bankdruecken-kh": {
    focus: "Brust, Trizeps, vordere Schulter",
    execution: "Hanteln über der Brust halten und seitlich absenken, bis sie auf Brusthöhe neben dem Körper sind, dann diagonal nach oben drücken.",
    tips: ["Unteres Ende spüren – volle Dehnung der Brust", "Handgelenke gerade halten, nicht nach hinten abknicken"],
  },
  "schraegbankdruecken-lh": {
    focus: "Oberbrust, vordere Schulter",
    execution: "Bank 15–30° ansteigen lassen. Stange kontrolliert zur Oberbrust absenken und nach oben drücken.",
    tips: ["Nicht steiler als 30°, sonst übernimmt die Schulter", "Ellenbogen leicht unter Schulterhöhe"],
  },
  "schraegbankdruecken-kh": {
    focus: "Oberbrust, vordere Schulter",
    execution: "Wie Schrägbankdrücken mit Langhantel: Hanteln zur Oberbrust absenken und diagonal nach oben drücken.",
    tips: ["Größere Dehnung unten möglich – langsam absenken", "Oben nicht die Hanteln zusammenschlagen"],
  },
  "fliegende-kh": {
    focus: "Brust (Dehnung + Kontraktion)",
    execution: "Hanteln mit leicht gebeugten Armen seitlich absenken, bis die Brust dehnt, dann in einem Bogen wieder nach oben führen.",
    tips: ["Ellenbogenwinkel die ganze Zeit halten", "Leichtes Gewicht – kein Pressen, nur Bogen schließen"],
  },
  "kabelzug-fliegende": {
    focus: "Brust (mittig)",
    execution: "Griffe auf Brusthöhe mit leicht gebeugten Armen nach vorne-innen zusammenführen und vorne kurz zusammenhalten.",
    tips: ["Leichte Vorwärtsneigung stabilisiert den Rumpf", "Schultern tief, Spannung aus der Brust"],
  },
  brustpresse: {
    focus: "Brust, vordere Schulter",
    execution: "Sitz so einstellen, dass die Griffe auf Brustmitte liegen. Griffe kraftvoll nach vorn drücken und kontrolliert zurückführen.",
    tips: ["Schulterblätter gegen die Lehne, Kopf liegt an", "Am Ende nicht ganz durchdrücken – Spannung halten"],
  },
  "butterfly-pec-deck": {
    focus: "Brust (mittig)",
    execution: "Arme auf Brusthöhe nach vorne-innen zusammenführen, vorne kurz halten und langsam zurück.",
    tips: ["Ellenbogen auf Griffhöhe, nicht tiefer", "Langsam arbeiten, am Ende der Bewegung Pause"],
  },
  "crossover-kabel": {
    focus: "Brust (untere + mittige Anteile)",
    execution: "Aus leichtem Ausfallschritt die Griffe vor dem Körper zusammenführen; die Hände dürfen sich leicht kreuzen.",
    tips: ["Oberkörper leicht vorgebeugt, Schultern tief", "Brust aktiv zusammenziehen, nicht nur Arme beugen"],
  },
  "dips-brust": {
    focus: "Unterbrust, Trizeps, vordere Schulter",
    execution: "Am Barren leicht nach vorne geneigt absenken, bis die Brust dehnt, dann hochdrücken.",
    tips: ["Vorwärtsneigung = Brustfokus", "Nicht tiefer als leichtes Dehnungsgefühl in der Schulter", "Schultern aktiv nach hinten-unten halten"],
  },

  // ---------- Rücken ----------
  klimmzuege: {
    focus: "Latissimus, Bizeps, obere Rückenmuskulatur",
    execution: "An der Stange hängen, Schultern aktiv nach unten ziehen, dann den Körper hinaufziehen, bis das Kinn über der Stange ist. Langsam ablassen.",
    tips: ["Ohne Schwung arbeiten", "Ellenbogen nach unten-innen führen", "Unten nicht einfach hängen lassen – Spannung halten"],
  },
  latzug: {
    focus: "Latissimus, Bizeps",
    execution: "Sitz, Brust raus, Stange zum oberen Brustbein ziehen und die Schulterblätter dabei zusammenziehen. Kontrolliert zurück.",
    tips: ["Oberkörper leicht nach hinten geneigt, nicht kippen", "Ellenbogen Richtung Hüfte führen"],
  },
  "rudern-lh": {
    focus: "Rücken (Mitte), Bizeps, Rückenstrecker",
    execution: "Oberkörper ca. 45° vorgebeugt, Rücken gerade, Stange zum Bauchnabel ziehen und kontrolliert absenken.",
    tips: ["Rücken bleibt gerade – kein Rundrücken", "Nicht mit Schwung aus dem Rücken hochreißen"],
  },
  "rudern-kh": {
    focus: "Rücken (Mitte), Latissimus",
    execution: "Eine Hand und ein Knie auf der Bank abstützen, die Hantel mit dem anderen Arm zur Hüfte ziehen.",
    tips: ["Schulterblatt Richtung Rückentasche ziehen", "Rumpf stabil – Hüfte bleibt gerade"],
  },
  "rudern-kabel": {
    focus: "Rücken (Mitte), Latissimus",
    execution: "Füße angestellt, Rücken gerade, Griff zum Bauch ziehen und die Ellenbogen eng am Körper führen.",
    tips: ["Oberkörper kaum mitbewegen", "Vorne dehnen, hinten Schulterblätter zusammenziehen"],
  },
  "rudern-maschine": {
    focus: "Rücken (Mitte)",
    execution: "Brust an das Polster, Griffe zum Körper ziehen und langsam in die Dehnung zurückführen.",
    tips: ["Ellenbogen ziehen – Hände nur festhalten", "Brust bleibt am Polster"],
  },
  "einarmiges-rudern-maschine": {
    focus: "Rücken (Mitte, seitlich)",
    execution: "Seitlich an der Maschine positionieren und einen Arm kontrolliert nach hinten zur Hüfte ziehen.",
    tips: ["Oberkörper ruhig halten, nicht mitdrehen", "Am Ende Schulterblatt zur Wirbelsäule ziehen"],
  },
  "enger-latzug": {
    focus: "Latissimus, Bizeps",
    execution: "Engen Griff (Unterhand oder neutral) nutzen und die Stange zum Brustbein ziehen.",
    tips: ["Ellenbogen nah am Körper", "Unten voll dehnen, oben Schulterblätter zusammen"],
  },
  rueckenstrecker: {
    focus: "Rückenstrecker",
    execution: "Hüfte an das Polster ausrichten, Oberkörper gegen Widerstand aufrichten und kontrolliert absenken.",
    tips: ["Bewegung klein halten – kein Hohlkreuz", "Hände vor der Brust kreuzen entlastet den Nacken"],
  },
  "tbar-rudern": {
    focus: "Rücken (Mitte), Latissimus",
    execution: "In die Beugeposition gehen, Rücken gerade, die T-Stange zum Brustbein ziehen.",
    tips: ["Beine stabil – kein Aufwippen des Oberkörpers", "Schultern tief halten"],
  },
  kreuzheben: {
    focus: "Ganz hinten: Rückenstrecker, Gesäß, Beinrückseite, Griff",
    execution: "Füße hüftbreit unter der Stange, Rücken gerade. Stange eng am Körper mit Kraft aus Beinen und Hüfte hochziehen, oben Hüfte voll durchstrecken.",
    tips: ["Rücken bleibt neutral – kein Rundrücken", "Stange an den Beinen entlangführen", "Knie nach außen drücken"],
  },
  ueberzuege: {
    focus: "Latissimus",
    execution: "Kabel von oben greifen, Ellenbogen Richtung Bauch führen und die Arme dabei fast gestreckt halten.",
    tips: ["Ellenbogen fixiert – Bewegung kommt aus der Schulter", "Hüfte stabil, kein Rumpfschwung"],
  },
  hyperextensions: {
    focus: "Rückenstrecker, Gesäß",
    execution: "Hüfte an das Polster, Oberkörper kontrolliert absenken und mit Gesäß und Rückenstreckern wieder anheben, bis der Körper gerade ist.",
    tips: ["Nicht über die gerade Linie hinaus überstrecken", "Arme vor der Brust halten"],
  },

  // ---------- Schultern ----------
  "schulterdruecken-lh": {
    focus: "Schultern (vorne + seitlich), Trizeps",
    execution: "Stange auf Schulterhöhe halten und nach oben drücken, bis die Arme gestreckt sind. Kontrolliert absenken.",
    tips: ["Core anspannen, kein Hohlkreuz", "Kopf leicht zurück, Stange knapp am Gesicht vorbei"],
  },
  "schulterdruecken-kh": {
    focus: "Schultern, Trizeps",
    execution: "Hanteln auf Schulterhöhe, nach oben drücken und oben fast zusammenführen.",
    tips: ["Handgelenke gerade", "Rücken an der Lehne, Füße fest"],
  },
  schulterpresse: {
    focus: "Schultern, Trizeps",
    execution: "Griffe auf Ohrhöhe einstellen, nach oben drücken und langsam zurückführen.",
    tips: ["Kopf ruhig halten, nicht nach vorne schieben", "Unten genug Range — bis Ohrhöhe"],
  },
  seitheben: {
    focus: "Schultern (seitlich)",
    execution: "Hanteln seitlich anheben bis Schulterhöhe und kontrolliert absenken. Die Ellenbogen führen die Bewegung.",
    tips: ["Ellenbogen leicht höher als das Handgelenk", "Leichtes Gewicht – kein Schwung aus dem Rumpf"],
  },
  "seitheben-kabel": {
    focus: "Schultern (seitlich)",
    execution: "Arm gegen den Kabelzug seitlich bis Schulterhöhe anheben und langsam zurückführen.",
    tips: ["Ständige Spannung — langsamer als mit Hanteln", "Nicht über Schulterhöhe hinaus"],
  },
  "seitheben-maschine": {
    focus: "Schultern (seitlich)",
    execution: "Polster an die Unterarme ausrichten und die Arme seitlich anheben.",
    tips: ["Schultern tief, keine Nackenbeteiligung", "Oben kurz halten"],
  },
  "vorgebeugtes-seitheben": {
    focus: "Schultern (hinten), oberer Rücken",
    execution: "Oberkörper vorgebeugt, Rücken gerade, Hanteln seitlich anheben und kontrolliert absenken.",
    tips: ["Ellenbogen leicht gebeugt", "Leichtes Gewicht, kein Auf-und-ab-Wippen"],
  },
  "face-pulls": {
    focus: "Hinterer Schulterkopf, oberer Rücken",
    execution: "Seil auf Augenhöhe zum Gesicht ziehen, Ellenbogen nach außen führen und die Hände dabei leicht nach hinten drehen.",
    tips: ["Ellenbogen auf Schulterhöhe", "Leichtes Gewicht – Endposition 1–2 s halten"],
  },
  "aufrechtes-rudern": {
    focus: "Schultern (seitlich), Trapez",
    execution: "Stange schulterbreit greifen und entlang des Körpers bis zum Brustbein ziehen.",
    tips: ["Ellenbogen zeigen nach oben", "Nicht enger greifen – belastet die Schultergelenke"],
  },
  nackendruecken: {
    focus: "Schultern, Trapez",
    execution: "Sitz einstellen und die Griffe kontrolliert nach oben drücken, langsam zurück.",
    tips: ["Langsam und ohne Schwung arbeiten", "Bei Druckgefühl im Nacken Range verkleinern"],
  },

  // ---------- Bizeps ----------
  "langhantel-curls": {
    focus: "Bizeps",
    execution: "Stange schulterbreit greifen, Ellenbogen am Körper, Stange nach oben beugen und langsam absenken.",
    tips: ["Ellenbogen bleiben fixiert", "Kein Schwung aus dem Rücken"],
  },
  "kurzhantel-curls": {
    focus: "Bizeps",
    execution: "Hanteln beugen und oben das Handgelenk leicht nach außen drehen, langsam absenken.",
    tips: ["Absenken 2–3 s – die negative Phase baut Muskeln", "Kein Mitreißen mit dem Oberkörper"],
  },
  "hammer-curls": {
    focus: "Bizeps, Unterarm",
    execution: "Neutrale Griffhaltung (Daumen oben), Hanteln beugen und kontrolliert absenken.",
    tips: ["Ellenbogen ruhig am Körper", "Unten nicht abrupt abbremsen"],
  },
  "scott-curls": {
    focus: "Bizeps",
    execution: "Oberarme auf das Polster legen, Stange beugen und bis fast gestreckte Arme absenken.",
    tips: ["Unteren Bereich nicht überspringen", "Unten voll dehnen – genau da wächst der Bizeps"],
  },
  "kabel-curls": {
    focus: "Bizeps",
    execution: "Ellenbogen am Körper, Griff zum Kinn ziehen und langsam zurück, bis die Arme fast gestreckt sind.",
    tips: ["Spannung bleibt auch unten erhalten", "Nicht nach hinten lehnen"],
  },
  "scott-curls-maschine": {
    focus: "Bizeps",
    execution: "Polster einstellen, Unterarme anlegen und gegen den Widerstand beugen, langsam absenken.",
    tips: ["Griffhöhe richtig einstellen", "Kontrolliert ablassen, nicht fallen lassen"],
  },
  "konzentrations-curls": {
    focus: "Bizeps (Spitze)",
    execution: "Ellbogen am Oberschenkel abstützen, konzentriert beugen und oben fest anspannen.",
    tips: ["Vollständige Bewegung von ganz unten bis ganz oben", "Oben 1–2 s anspannen"],
  },

  // ---------- Trizeps ----------
  "trizepsdruecken-kabel": {
    focus: "Trizeps",
    execution: "Ellenbogen am Körper halten, Griff nach unten drücken bis die Arme gestreckt sind, langsam zurück.",
    tips: ["Ellenbogen fixiert – bewegen sich kaum", "Beim Seil oben nach außen auseinanderdrücken"],
  },
  "dips-trizeps": {
    focus: "Trizeps, Brust",
    execution: "Aufrecht am Barren absenken (Ellenbogen eng am Körper) und hochdrücken.",
    tips: ["Oberkörper aufrecht = Trizepsfokus", "Nicht zu tief absenken – Schulter schonen"],
  },
  franzoesisch: {
    focus: "Trizeps (Kopf hinten)",
    execution: "Hantel über dem Kopf halten, Ellenbogen zeigen nach oben. Hantel hinter den Kopf absenken und strecken.",
    tips: ["Ellenbogen fest positioniert, bewegen sich kaum", "Handgelenke gerade halten"],
  },
  "trizeps-kickbacks": {
    focus: "Trizeps",
    execution: "Oberkörper vorgebeugt, Oberarm parallel zum Boden, nur den Unterarm nach hinten strecken.",
    tips: ["Oberarm komplett still halten", "Oben kurz anspannen"],
  },
  "eng-bankdruecken": {
    focus: "Trizeps, Unterbrust",
    execution: "Stange schulterbreit greifen, zur unteren Brust absenken und drücken.",
    tips: ["Ellenbogen eng am Körper führen", "Handgelenke gerade, nicht abknicken"],
  },
  "trizeps-presse": {
    focus: "Trizeps",
    execution: "Sitz einstellen, Griffe drücken bis die Arme gestreckt sind, kontrolliert zurück.",
    tips: ["Ellenbogen stabil halten", "Langsam zurück – nicht zusammenschnappen lassen"],
  },

  // ---------- Beine ----------
  kniebeugen: {
    focus: "Beinstrecker, Gesäß, Beinbeuger, Core",
    execution: "Stange auf dem Rücken (Trapez), Füße schulterbreit. In die Hocke absenken bis Oberschenkel parallel, kraftvoll hochdrücken.",
    tips: ["Rücken gerade, Brust raus", "Knie folgen den Fußspitzen", "Fersen bleiben am Boden"],
  },
  frontkniebeugen: {
    focus: "Beinstrecker, oberer Rücken, Core",
    execution: "Stange vor den Schultern (Ellenbogen hoch), aufrecht in die tiefe Hocke absenken und hochdrücken.",
    tips: ["Ellenbogen oben halten – sonst kippt der Torso", "Aufrechterer Rumpf als beim Back Squat"],
  },
  beinpresse: {
    focus: "Beinstrecker, Gesäß, Beinbeuger",
    execution: "Füße hüftbreit auf die Plattform, bis ca. 90° im Knie absenken und kraftvoll drücken, ohne ganz durchzustrecken.",
    tips: ["Lendenwirbelsäule bleibt an der Lehne", "Knie nicht nach innen einknicken", "Fersen flach auf der Plattform"],
  },
  hackenschmidt: {
    focus: "Beinstrecker, Gesäß",
    execution: "Schultern unter die Polster, kontrolliert absenken bis Oberschenkel parallel, kraftvoll hochdrücken.",
    tips: ["Rücken bleibt an der Lehne", "Knie zeigen in Richtung der Fußspitzen"],
  },
  ausfallschritte: {
    focus: "Beinstrecker, Gesäß, Beinbeuger",
    execution: "Großer Schritt nach vorne, hinteres Knie Richtung Boden absenken und kraftvoll hochdrücken.",
    tips: ["Oberkörper aufrecht", "Vorderes Knie bleibt über dem Fuß"],
  },
  "rumaenisches-kreuzheben": {
    focus: "Beinbeuger, Gesäß, Rückenstrecker",
    execution: "Beine leicht gebeugt, Hantel an den Beinen entlang nach unten führen – Bewegung aus der Hüfte, nicht aus dem Rücken. Hüfte oben kraftvoll strecken.",
    tips: ["Rücken neutral, Hantel berührt die Beine", "Abbrechen, sobald die Beinrückseite dehnt", "Oben Gesäß anspannen, kein Hohlkreuz"],
  },
  beinbeuger: {
    focus: "Beinbeuger",
    execution: "Bauch am Polster, Fersen Richtung Po ziehen und langsam kontrolliert zurückführen.",
    tips: ["Hüfte bleibt auf dem Polster", "Kein Schwung – langsam zurück"],
  },
  "beinbeuger-sitzend": {
    focus: "Beinbeuger",
    execution: "Kniegelenk an das Polster ausrichten, Fersen ziehen und langsam zurückführen.",
    tips: ["Oberschenkel bleiben auf dem Polster", "Unten dehnen, oben anspannen"],
  },
  beinstrecker: {
    focus: "Beinstrecker",
    execution: "Beine gegen Widerstand strecken bis fast gerade, oben kurz halten, langsam absenken.",
    tips: ["Oben fest anspannen", "Kein Schwung aus der Hüfte"],
  },
  adduktoren: {
    focus: "Adduktoren",
    execution: "Beine gegen Widerstand zusammenführen, vorne kurz halten und langsam öffnen.",
    tips: ["Oberkörper aufrecht", "Bei weiter Öffnung sanft dehnen – nicht ruckartig"],
  },
  "wadenheben-stehend": {
    focus: "Waden",
    execution: "Auf die Zehenspitzen drücken, oben kurz halten, langsam so tief absenken, dass die Wade dehnt.",
    tips: ["Voller Bewegungsumfang – oben wie unten", "Knie durchgestreckt"],
  },
  "wadenheben-sitzend": {
    focus: "Waden (tiefer liegender Muskel)",
    execution: "Sitzend das Gewicht über die Zehenspitzen heben, oben halten, langsam absenken.",
    tips: ["Langsame Wiederholungen, kein Abreißen", "Oben 1–2 s halten"],
  },
  "beinpresse-ei": {
    focus: "Beinstrecker, Gesäß",
    execution: "Wie Beinpresse, aber nur ein Bein auf der Plattform.",
    tips: ["Hüfte gerade halten, nicht wegkippen", "Weniger Gewicht wählen als beidbeinig"],
  },

  // ---------- Gesäß ----------
  "hip-thrust": {
    focus: "Gesäß, Beinbeuger",
    execution: "Oberer Rücken an der Bank, Stange über der Hüfte, Füße hüftbreit. Hüfte strecken, bis der Körper von Schultern bis Knien gerade ist, oben Gesäß anspannen.",
    tips: ["Schulterblätter an die Bankkante", "Blick nach vorn – Kinn leicht an", "Nur bis zur geraden Linie strecken, nicht überstrecken"],
  },
  "glute-bridge": {
    focus: "Gesäß, Beinbeuger",
    execution: "Rücken am Boden, Füße hüftbreit nah am Po. Hüfte heben bis zur geraden Linie, oben anspannen, langsam absenken.",
    tips: ["Kraft kommt aus dem Gesäß", "Fersen aktiv in den Boden drücken"],
  },
  "kabel-kickbacks": {
    focus: "Gesäß",
    execution: "Kabel am Knöchel, Bein kontrolliert nach hinten-oben strecken und langsam zurückführen.",
    tips: ["Oberkörper ruhig, kein Schwung", "Gesäß spannt – Arme/Beinschwung helfen nicht"],
  },
  abduktoren: {
    focus: "Gesäß (seitlich)",
    execution: "Beine gegen Widerstand nach außen führen, oben kurz halten, langsam zurück.",
    tips: ["Oberkörper leicht nach vorn = mehr oberes Gesäß", "Ruhige Bewegung, kein Rucken"],
  },
  "hip-thrust-maschine": {
    focus: "Gesäß",
    execution: "Rücken an die Polster, Füße auf die Plattform, Hüfte nach oben drücken, oben anspannen.",
    tips: ["Sitz richtig einstellen – Polster auf Hüfthöhe", "Oben Gesäß bewusst anspannen"],
  },

  // ---------- Bauch ----------
  plank: {
    focus: "Core (Bauch, Rücken)",
    execution: "Unterarmstütz, Körper bildet eine gerade Linie von Kopf bis Fersen. Bauch und Po anspannen und halten.",
    tips: ["Hüfte nicht durchhängen und nicht anheben", "Weiter atmen – nicht die Luft anhalten"],
  },
  crunches: {
    focus: "Bauch (gerade Muskeln)",
    execution: "Rücken rund machen, Schultern heben vom Boden, oben anspannen und langsam absenken.",
    tips: ["Nacken entspannt – nicht mit den Händen am Kopf ziehen", "Langsam absenken statt fallen zu lassen"],
  },
  "kabel-crunches": {
    focus: "Bauch (gerade Muskeln)",
    execution: "Seil hinter dem Kopf, knien, den Rumpf Richtung Knie beugen und oben anspannen.",
    tips: ["Aus der Bauchmuskulatur rund machen – nicht mit der Hüfte kippen", "Hüfte bleibt oben, Bewegung kommt von der Wirbelsäule"],
  },
  beinheben: {
    focus: "Unterer Bauch",
    execution: "Hängend die Beine anheben, bis die Hüfte beugt, und langsam absenken.",
    tips: ["Schwung vermeiden – langsam hoch und runter", "Bauch anspannen, Becken leicht Richtung Brust kippen"],
  },
  "russian-twist": {
    focus: "Bauch (seitlich)",
    execution: "Sitzen, Oberkörper leicht zurückgeneigt, mit dem Gewicht seitlich drehen.",
    tips: ["Rücken gerade halten", "Langsam drehen, nicht ruckartig"],
  },
  "ab-wheel": {
    focus: "Core, Latissimus",
    execution: "Aus dem Kniestand die Rolle nach vorne schieben, Rücken bleibt gerade, dann mit der Bauchspannung zurückziehen.",
    tips: ["Kein Durchhängen im unteren Rücken", "Reichweite langsam steigern"],
  },

  // ---------- Ganzkörper ----------
  "kreuzheben-rumaenisch-gh": {
    focus: "Beinbeuger, Gesäß, Rückenstrecker",
    execution: "Wie Rumänisches Kreuzheben: Hüftbeugung, Hantel an den Beinen entlang, Rücken gerade, oben Hüfte strecken.",
    tips: ["Bewegung aus der Hüfte, nicht aus dem Rücken", "Oben Gesäß anspannen"],
  },
  "kettlebell-swing": {
    focus: "Ganzkörper: Gesäß, Beinrückseite, Core, Schultern",
    execution: "Kettlebell zwischen den Beinen pendeln und mit kraftvollem Hüftstoß nach oben schnippen bis Brusthöhe.",
    tips: ["Kraft kommt aus Hüfte und Po – die Arme sind nur Seile", "Rücken gerade, kein Rundrücken"],
  },
  "farmers-walk": {
    focus: "Ganzkörper: Griff, Core, Schultern",
    execution: "Schwere Gewichte in beiden Händen, aufrecht und ruhig gehen.",
    tips: ["Schultern aktiv nach unten ziehen", "Core anspannen, kurze Schritte"],
  },

  // ---------- Cardio ----------
  laufband: {
    focus: "Ausdauer, Beine",
    execution: "Einsteigen, langsam starten und Tempo/Steigung schrittweise steigern. Intensität über Geschwindigkeit und Steigung steuern.",
    tips: ["Vorher einige Minuten warmlaufen", "Nicht am Geländer ziehen – Arme frei bewegen"],
  },
  "cross-trainer": {
    focus: "Ausdauer, Ganzkörper",
    execution: "Füße auf die Pedale, Arme mitführen, gleichmäßiger Rhythmus. Intensität über Widerstand und Trittfrequenz.",
    tips: ["Rücken gerade, Core anspannen", "Gelenkschonend – gut für lange Einheiten"],
  },
  stepper: {
    focus: "Ausdauer, Gesäß, Beine",
    execution: "Gleichmäßig treten, Handgriffe nur zur Absicherung. Intensität über Widerstand und Schrittrate.",
    tips: ["Ganze Sohle auf die Stufe", "Oberkörper aufrecht, nicht nach vorne hängen"],
  },
  treppensteiger: {
    focus: "Ausdauer, Gesäß, Beine",
    execution: "Wie eine Treppe treten, gleichmäßiger Rhythmus. Intensität über Geschwindigkeit und Widerstand.",
    tips: ["Nicht an den Handgriffen abstützen", "Tiefe Schritte aktivieren mehr Gesäß"],
  },
  ruderergometer: {
    focus: "Ausdauer, Rücken, Beine",
    execution: "Pro Zug: Beine drücken, Rumpf leicht zurücklehnen, Arme ziehen – und in umgekehrter Reihenfolge zurück.",
    tips: ["Reihenfolge: Beine, Rumpf, Arme", "Rücken gerade halten, nicht hohl"],
  },
  "fahrrad-ergometer": {
    focus: "Ausdauer, Beine",
    execution: "Sitz auf Hüfthöhe einstellen, Pedale rund treten. Intensität über Widerstand und Trittfrequenz.",
    tips: ["Sattelhöhe: Bein unten fast gestreckt", "Widerstand dosieren – nicht nur schnell strampeln"],
  },
  "spinning-bike": {
    focus: "Ausdauer, Beine",
    execution: "Sitz und Lenker einstellen, im Stehen und Sitzen treten. Intensität über Widerstand und Kadenz.",
    tips: ["Sattel und Lenker korrekt einstellen", "Im Stehen Gewicht hinter dem Lenker halten"],
  },
};
