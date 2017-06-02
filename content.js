chrome.storage.sync.get(null, function(obj) {
  walk(document.body)
})

// Credit to t-j-crowder on StackOverflow for this walk function
// http://bit.ly/1o47R7V
function walk(node) {
  var child, next

  switch (node.nodeType) {
    case 1:  // Element
    case 9:  // Document
    case 11: // Document fragment
      child = node.firstChild
      while (child) {
        next = child.nextSibling
        walk(child)
        child = next
      }
      break
    case 3:  // Text node
      convert(node)
      break
  }
}

function convert(textNode) {
  isisPattern = new RegExp('(ISIS)|(ISIL)|(Islamic State)|(Isis)|(Isil)', 'g')
  textNode.nodeValue = textNode.nodeValue.replace(isisPattern, "Evil Losers")
  hillPattern = new RegExp('(Hillary Clinton)|(Hillary Rodham Clinton)|(Mrs\. Clinton)', 'g')
  textNode.nodeValue = textNode.nodeValue.replace(hillPattern, "Crooked Hillary")
  fakeNewsPattern = new RegExp('(CNN)|(NBC)|(NYTimes)|(NYT)|(New York Times)|(NBC News)|(HuffPo)|(Huffington Post)|(ABC News)|(American Broadcasting Company)|(CBS)', 'g')
  textNode.nodeValue = textNode.nodeValue.replace(fakeNewsPattern, "FAKE NEWS")
  cruzPattern = new RegExp('Ted Cruz', 'g')
  textNode.nodeValue = textNode.nodeValue.replace(cruzPattern, "Lyin' Ted")
  marcoPattern = new RegExp('(Marco Rubio)|(Rubio)', 'g')
  textNode.nodeValue = textNode.nodeValue.replace(marcoPattern, "Little Marco")
  jebPattern = new RegExp('(Jeb Bush)|(Jeb)', 'g')
  textNode.nodeValue = textNode.nodeValue.replace(jebPattern, "Low Energy Jeb")
  warrenPattern = new RegExp('Elizabeth Warren', 'g')
  textNode.nodeValue = textNode.nodeValue.replace(warrenPattern, "Pocahontas")
}
