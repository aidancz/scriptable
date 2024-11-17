// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
//d1 & d2
const d1 = new Date()
d1.setDate(d1.getDate()-7)
const d2 = new Date()
d2.setMonth(d2.getMonth()+1)
console.log(`d1:${d1.toISOString()} d2:${d2.toISOString()}`)

//rmd
const rmd = await Reminder.allDueBetween(d1, d2)
console.log(`Get ${rmd.length} rmd`)

//rmdPin
let rmdPin = await CalendarEvent.between(d1, d2)
rmdPin = rmdPin.filter(x => x.notes != null && x.notes.includes("[rmdId]"))
console.log(`Get ${rmdPin.length} rmdPin`)

//---
console.log("---")

//Delete rmdPins that have wrong rmdId, or the rmdId is duplicate
const reg = /\[rmdId\]\n([A-Z0-9\-]*)/
const rmdIdSet = new Set(rmd.map(x => x.identifier))
const rmdPinIdSet = new Set()
var n = 0
for (const i of rmdPin) {
  const match = i.notes.match(reg)
  if (!rmdIdSet.has(match[1])) {i.remove(), n += 1}
  if (!rmdPinIdSet.has(match[1])) rmdPinIdSet.add(match[1])
  else {i.remove(), n += 1}
}
console.log(`Delete ${n} rmdPin`)

//Update rmdPin
var n = 0
for (const i of rmd) {
  const i_rmdPinNotes = `[rmdId]\n${i.identifier}`
  var [i_rmdPin] = rmdPin.filter(x => x.notes.includes(i_rmdPinNotes))
  //Iterable destructuring, i_rmdPin will get the first value in rmdPin array
  //Use "var" to escape block scope
  if (!i_rmdPin) {
    var i_rmdPin = new CalendarEvent()
    i_rmdPin.notes = i_rmdPinNotes
    console.log(`rmdPin added\t\t(rmdTitle:${i.title})`)
  }
  await rmdPin_update(i_rmdPin, i)
  n += 1
}
console.log(`Update ${n} rmdPin`)

//Complete
Script.complete()

//---

//rmdPin_update()
async function rmdPin_update(rmdPin, rmd) {
  const calTitle = rmd.calendar.title
  rmdPin.calendar = await Calendar.forEventsByTitle(calTitle)
  rmdPin.title = await rmdPin_title(rmd)
  rmdPin.startDate = rmd.dueDate
  rmdPin.endDate = rmd.dueDate
  rmdPin.isAllDay = rmd.isCompleted || !rmd.dueDateIncludesTime
  rmdPin.save()
  //console.log(`rmdPin updated\t(rmdTitle:${rmd.title})`)
}

//rmdPin_title()
async function rmdPin_title(rmd) {
  let title = ""
  if (rmd.isCompleted) {title += "✅"}
  if (!rmd.isCompleted && rmd.isOverdue) {title += "⚠️"}
  if (rmd.priority) {title += "❗️"}
  title += rmd.title
  return title
}
