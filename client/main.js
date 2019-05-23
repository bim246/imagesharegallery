import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import {Session} from 'meteor/session';
import {Accounts} from  'meteor/accounts-base';

import './main.html';
import '../lib/collection.js';

Session.set('imgLimit', 3);
Session.set('usershow', false);

Accounts.ui.config({
	passwordSignupFields: 'USERNAME_ONLY',
});

Template.myJumbo.events({
	'click .js-addImg'(event){
		$("#addImgModal").modal("show");
	}
});

Template.addImg.events({
	'click .js-saveImg'(event){
		var imgTitle = $("#imgTitle").val();
		var imgPath = $("#imgPath").val();
		var imgDesc = $("#imgDesc").val();
		
		$("#imgTitle").val('');
		$("#imgPath").val('');
		$("#imgDesc").val('');
		$("#addImgPreview").attr('src','user-512.png');
		$("#addImgModal").modal("hide");
		imagesDB.insert({"title":imgTitle, "Rating":0, "path":imgPath, "creatorName":Meteor.user().username, "PostedBy":Meteor.user()._id, "desc":imgDesc, "createdOn":Date()});
	},

	'input #imgPath'(event){
		var imgPath = $("#imgPath").val();
		$("#addImgPreview").attr('src', imgPath);
	}
});

Template.mainBody.helpers({
	imagesFound(){
		return imagesDB.find().count();
	},
	allImages(){
		var prevTime = new Date() - 15000;
		if(Session.get('usershow')){
			return imagesDB.find({PostedBy:Session.get('usershow')});
		}
		else{
			var newResults = imagesDB.find({createdOn:{$gte:prevTime}}).count();
			if (newResults>0){
				return imagesDB.find({}, {sort:{createdOn:-1,Rating: -1},limit:Session.get('imgLimit')});
			} else {
				return imagesDB.find({}, {sort:{Rating: -1,createdOn:-1},limit:Session.get('imgLimit')});
			}
		}
	},
	OwnImage(){
		if(Meteor.user()){
			if(Meteor.user()._id==imagesDB.findOne({'_id':this._id}).PostedBy){
				return true;
			}
		}
		return false;
	}
});
Template.mainBody.events({
	'click .js-deleteImg'(){
		var imgId = this._id;
		$("#"+imgId).fadeOut('slow', function(){
			imagesDB.remove({_id:imgId});
		});
	},
	'click .js-rate'(Event,instance){
		var imgID =this.data_id;
		var rating = $('#rating').data('userrating');
		console.log(rating," stars - ",imgID);
		imagesDB.update({"_id":imgID}, {$set:{'Rating':rating}});
	},
	'click .js-userShow'(event){
		event.preventDefault();
		Session.set('usershow',this.PostedBy);
	},

	'click .js-searchEnd'(event){
		Session.set('usershow',false);	
	},

	'click .js-edit'(){
		var imgId = this._id;
		$('#ImgPreview').attr('src',imagesDB.findOne({_id:imgId}).path);
		$("#eimgTitle").val(imagesDB.findOne({_id:imgId}).title);
		$("#eimgPath").val(imagesDB.findOne({_id:imgId}).path);
		$("#eimgDesc").val(imagesDB.findOne({_id:imgId}).desc);
		$('#eId').val(imagesDB.findOne({_id:imgId})._id);
		$('#editImgModal').modal("show");

	}
});
Template.editImg.events({
	'click .js-updateImg'(){
		var eId = $('#eId').val();
		var imgTitle = $("#eimgTitle").val();
		var imgPath = $("#eimgPath").val();
		var imgDesc = $("#eimgDesc").val();
		imagesDB.update({_id:eId}, {$set:{"title":imgTitle, "path":imgPath, "desc":imgDesc}});
		$('#editImgModal').modal("hide");
	}
});


lastScrollTop =0;
$(window).scroll(function(Event){
	if($(window).scrollTop() + $(window).height() > $(document).height()-100){
		var scrollTop = $(this).scrollTop();
		if(scrollTop>lastScrollTop){
			console.log("We have arrived at the bottom of the page");
			Session.set('imgLimit', Session.get('imgLimit')+3);
		}
		lastScrollTop=scrollTop;
	}
});