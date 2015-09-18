import Ember from 'ember';
import ENV from "../../config/environment";
import ajax from 'ic-ajax';

export default Ember.Route.extend({
    model: function(params) {
        return ajax({
            url: `${ENV.CORE_FULL_URL}/projects/${params.project_id}`,
            type: 'get'
        }).then(function(project) {
            return project;
        });
    }
});
