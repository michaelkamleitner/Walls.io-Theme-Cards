prependCheckins = function (container, checkins) {
    $(container).prepend(checkins).masonry("prepended", checkins);
  };

createCheckin = function(checkin) {
  var $checkinContainer, $checkin, $checkinContent, $checkinType, $checkinUser, bg_color_classes, message;
  bg_color_classes = ['purple', 'yellow', 'green', 'blue', 'gray'];

  message = checkin.comment;

  if (!checkin.post_image && !message) {
    return;
  }

  if (checkin.tags) {
    checkin.tags = checkin.tags.replace(/#/g, "");
  }

  $checkinContainer = $.tmpl("checkin-container-template", {
    id: checkin.id,
    type: checkin.type,
    tags: checkin.tags,
    color: bg_color_classes[Math.floor((Math.random()*bg_color_classes.length))]
  });

  $checkin = $checkinContainer.find(".socialwall_checkin");

  //checkin.post_image='http://like.farm/like.farm.jpg';

  if (checkin.post_image) {
    $checkinContainer.addClass("image");
    $checkin.addClass("image");

    if (checkin.message) {
      $checkinContainer.addClass("has-message");
    }
  }

  if (checkin.post_image) {
    $checkinContent = $.tmpl("checkin-image-template", {
      id: checkin.id,
      image: checkin.post_image,
      message: message
    });
  } else {
    $checkinContent = $.tmpl("checkin-message-template", {
      message: message
    });
  }

  if (message) {
    message = emoji.replace_unified(message);

    $checkinContainer.addClass("message");
    $checkin.addClass("image");
  }

  $checkinUser = $.tmpl("checkin-user-template", {
    type: checkin.type,
    userName: checkin.external_fullname,
    userHandle: checkin.external_name,
    userId: checkin.external_user_id,
    image: checkin.external_image,
    createdTimestamp: checkin.created.replace(' ','T')+'Z',
    postId: checkin.post_id,
    postLink: checkin.post_link
  });

  $checkin.append($checkinUser);
  $checkin.append($checkinContent);

  return $checkinContainer;
};

$( document ).ready(function() {
  $.template("checkin-container-template", $("#checkin-container-template"));
  $.template("checkin-image-template", $("#checkin-image-template"));
  $.template("checkin-message-template", $("#checkin-message-template"));
  $.template("checkin-type-template", $("#checkin-type-template"));
  $.template("checkin-user-template", $("#checkin-user-template"));

  var count = 0;
  colWidth = $('.grid-sizer').width();

  $("#container").masonry({
    columnWidth: colWidth,
    itemSelector: '.socialwall_checkin_wrapper',
    gutter: 20,
    hiddenStyle: {
      opacity: 0
    }
  });
  $("#container").masonry("layout");
  $(".socialwall_timestamp").timeago();

  var stream = new WallStreamCore({
    accessToken: "8007b2792ec4dbafa37f1fb30121fc61deacf028", // required
    initialLimit: 1,
    interval: 2000,
    onPost: function(post) {
      console.log(post);
      //if (count < 1) {
        $checkin = createCheckin(post);
        prependCheckins("#container", $checkin);
        $.timeago($(".socialwall_timestamp a"));
      //}
      count++;
    }
  });

});
