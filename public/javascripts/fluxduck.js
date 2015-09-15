$(document).ready(function() {

  $("#1").hide("fast");

  $("#2").hide("fast");

  $("#3").hide("fast");

  $("#4").hide("fast");

  $("#5").hide("fast");

  $("#6").hide("fast");

  $("#7").hide("fast");

  $("#8").hide("fast");

  $("#9").hide("fast");

  $("#10").hide("fast");

  $("#li1").click(function(){
    $("#1").toggle("fast");
  });

  $("#li2").click(function(){
    $("#2").toggle("fast");
  });

  $("#li3").click(function(){
    $("#3").toggle("fast");
  });

  $("#li4").click(function(){
    $("#4").toggle("fast");
  });

  $("#li5").click(function(){
    $("#5").toggle("fast");
  });

  $("#li6").click(function(){
    $("#6").toggle("fast");
  });

  $("#li7").click(function(){
    $("#7").toggle("fast");
  });

  $("#li8").click(function(){
    $("#8").toggle("fast")
  });

  $("#li9").click(function(){
    $("#9").toggle("fast");
  });

  $("#li10").click(function(){
    $("#10").toggle("fast")
  });

  $('#bar').keydown(function(event) {
  if (event.keyCode == 13) {
    sendXMLhttprequest();
    return false;
  }
});
});

var result="";
var url = "http://localhost:3000/";

function sendXMLhttprequest() {
  //$('#myForm').submit();
  var data = $("#bar").val();
  var flag = 0;

  $.post(url, data, function(result, status, xhr) {
    if (status == "success") {
      //alert(result);
      var list = JSON.parse(result);

      var swapped = false;
      do {
        swapped = false;
        for (var i=0; i < list.length-1; i++) {
          if (list[i].Value < list[i + 1].Value) {
            var temp = list[i];
            list[i] = list[i + 1];
            list[i + 1] = temp;
            swapped = true;
          }
        }
      } while (swapped);

      for (var i = 0; i < list.length-1; i++) {
        id = i + 1;
        lId = "#li" + id;
        id = "#" + id;

        $(lId).children("h1:first").remove();
        $(lId).prepend("<h1>" +list[i].company+ "</h1>");

        $(id).html("Sentiment Analysis Score: " +list[i].Value);
        $(id).append("<br><p>2. <a href='"+ list[i].url +"'>Go to Indeed job listing</a></p>");
        $(id).append("<br><p>3. Wolfram News Media Analysis: </p><a href='https://www.wolframcloud.com/objects/user-9ad46431-f053-494c-9ec6-d1601bb7f2c0/SentimentAnalysisStocksInNews?stock='>Go to page</a>");

        //alert("company: " +list[i].company+ ", value: " +list[i].Value);
      }

    } else {
      alert(status);
      flag = -1;
    }

    //$('#myForm').submit();
  }, "text");

  //$('#myForm').submit();
}