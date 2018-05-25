""/* Javascript for TeamsView */
function SgaTeamView(runtime, element) {
    "use strict";
    /*eslint no-undef: "error"*/
    StaffGradedAssignmentXBlock(runtime, element);

    var getTeamGradingUrl = runtime.handlerUrl(
          element, 'get_team_grading_data'
        );
    var downloadUrl = runtime.handlerUrl(element, 'team_download');
    var uploadUrl = runtime.handlerUrl(element, 'upload_assignment');
    var finalizeUploadUrl = runtime.handlerUrl(element, 'finalize_uploaded_assignment');
    var gradingTemplate;
    var dataState;
    var block;

    function renderTeamGrading(state){
        state.downloadUrl = downloadUrl;
        state.error = state.error || false;

        var finalState = $.extend(state, dataState);

        var content = $(element).find('#sga-content').html(gradingTemplate(finalState));

        var fileUpload = $(content).find('.fileupload').fileupload({
            url: uploadUrl,
            add: function(e, data) {
                var do_upload = $(content).find('.upload').html('');
                $(content).find('p.error').html('');
                do_upload.text(gettext('Uploading...'));
                var block = $(element).find('.sga-block');
                var data_max_size = block.attr("data-max-size");
                var size = data.files[0].size;
                if (!_.isUndefined(size)) {
                    if (size >= data_max_size) {
                        state.error = gettext('The file you are trying to upload is too large.');
                        renderTeamGrading(state);
                        return;
                    }
                }
                data.submit();
            },
            progressall: function(e, data) {
                var percent = parseInt(data.loaded / data.total * 100, 10);
                $(content).find('.upload').text(
                    'Uploading... ' + percent + '%');
            },
            fail: function(e, data) {
                if (data.jqXHR.status === 413) {
                    state.error = gettext('The file you are trying to upload is too large.');
                } else {
                    state.error = gettext('There was an error uploading your file.');
                    console.log('There was an error with file upload.');
                    console.log('event: ', e);
                    console.log('data: ', data);
                }
                renderTeamGrading(state);
            },
            done: function(e, data) {
                if (data.result.success !== undefined) {
                    state.error = data.result.success;
                    renderTeamGrading(state);
                } else {
                    $.ajax({
                        url: getTeamGradingUrl,
                        success: renderTeamGrading
                    });
                }
            }
        });

    }

    $(function ($) {

        gradingTemplate = _.template(
                    $(element).find('#sga-grading-tmpl').text());

        var block = $(element).find('.sga-block');
        dataState = block.attr('data-state');
        dataState = JSON.parse(dataState);

        $.ajax({
                url: getTeamGradingUrl,
                success: renderTeamGrading
                });

    });
}
