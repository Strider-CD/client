import Ember from 'ember';
import ENV from "../../config/environment";
import ajax from 'ic-ajax';

export default Ember.Route.extend({
    model: function(params) {
        return ajax({
            url: 'http://localhost:8000/api/v1/projects/' + params.project_id,
            type: 'get'
        }).then(function(project) {
            return project;
        });
    }
});
