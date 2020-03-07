$(document)
  .ready(function () {
    $("#version").html("v0.14");

    $("#searchbutton").click(function (e) {
      displayModal();
    });

    $("#searchfield").keydown(function (e) {
      if (e.keyCode == 13) {
        displayModal();
      }
    });

    function displayModal() {
      $("#myModal").modal('show');

      $("#status").html("Searching...");
      $("#dialogtitle").html("Search for: " + $("#searchfield").val());
      $("#previous").hide();
      $("#next").hide();
      $.getJSON('/search/' + $("#searchfield").val(), function (data) {
        renderQueryResults(data);
      });
    }

    //Array of images
    images = [];

    //Current index where we cycle through the results of links
    curr_index = 0;

    //The functionality of the next button is the same as rendering function.
    $("#next").click(function (e) {
      curr_index++;
      let maxImagesToRender = images.length - (curr_index * 4);
      let i;
      for (i = 0; i < maxImagesToRender; i++) {
        $(`#img${i}`).attr("src", images[i + (curr_index * 4)]);
        $(`#img${i}`).show();
      }
      //Hide the remaining input elements.
      for (; i <= 3; i++) {
        $(`#img${i}`).hide();
      }
      $("#previous").show();
      if (maxImagesToRender < 4) 
        $(this).hide();
      }
    );
    $("#previous").click(function (e) {
      curr_index--;
      for (let i = 0; i < 4; i++) {
        $(`#img${i}`).attr("src", images[i + (curr_index * 4)]);
        $(`#img${i}`).show();
      }
      $("#next").show();
      if (curr_index == 0) 
        $(this).hide();
      }
    );

    function renderQueryResults(data) {
      images = [];
      if (data.error != undefined) {
        $("#status").html("Error: " + data.error);
      } else {
        curr_index = 0;
        $("#status").html("" + data.num_results + " result(s)");
        let maxImagesToRender = (data.num_results >= 4)
          ? 4
          : data.num_results;
        let i;
        images = data.results;
        for (i = 0; i < maxImagesToRender; i++) {
          console.log(data);
          $(`#img${i}`).attr("src", images[i]);

        }
        console.log("Current i: ", i);
        //Hide the remaining of images (in case in the results before this data results were more than this data results).
        for (; i <= 3; i++) {
          $(`#img${i}`).hide();
        }

        //In the first cycle of images the only button available should be next so we hide previous button
        $("#previous").hide();

        //If there were more than 4 images then show next button
        if (data.num_results > 4) {
          $("#next").show();
        }

      }
    }
  });
