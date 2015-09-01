$(function() {

	$(document).on('click', '.btn-submit', function(){
		$('.btn-collapse').remove();
		$('.btn-expand').remove();
		$('.btn-toggle').remove();
	});

	$(document).on('click', '.btn-collapse', function(){
		$(this).parent().find('.result').JSONView('collapse');
	});

	$(document).on('click', '.btn-expand', function(){
		$(this).parent().find('.result').JSONView('expand');
	});

	$(document).on('click', '.btn-toggle', function(){
		$(this).parent().find('.result').JSONView('toggle');
	});

	$(document).on('click', '.btn-submit', function(){
		var $obj = $(this);
		$obj.button('loading');
		$obj.parents('.panel-collapse').find('.result').removeClass('hidden').hide();
		var url = $obj.parents('.panel-collapse').find('pre').html().replace('URL : ', '');

		var $form = $obj.parents('form');
		var form = {}
		form.apiKey = $('#apiKey').val();
		$form.find('input').each(function(){
			var key = $.trim($(this).attr('class').replace('form-control', ''));
			form[key] = $(this).val();
		});	
		
		$.post( '//' + window.location.host + url, form , function(data){ showData($obj, data) }, 'json');

	});

});

function showData($obj, data){
	var $dv = $obj.parents('.panel-collapse').find('.result');
	$dv.JSONView(data, {collapsed: true}).show();
	$dv.before('<span class="btn btn-xs btn-default margin-top-10 btn-collapse">Collapse</span> <span class="btn btn-xs btn-default margin-top-10 btn-expand">Expand</span> <span class="btn btn-xs btn-default margin-top-10 btn-toggle">Toggle</span>');
	$obj.button('reset');
}