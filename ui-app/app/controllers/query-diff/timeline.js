/*
 *
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms of the
 * Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party authorized
 * to distribute this code.  If you do not have a written agreement with Hortonworks or with an authorized and
 * properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3:
 * (A) HORTONWORKS PROVIDES THIS CODE TO YOU WITHOUT WARRANTIES OF ANY KIND;
 * (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH RESPECT TO THIS CODE, INCLUDING BUT NOT
 *   LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE;
 * (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY, OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING
 *   FROM OR RELATED TO THE CODE; AND
 * (D) WITH RESPECT TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY
 *   DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 *   DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 *   OR LOSS OR CORRUPTION OF DATA.
 *
 */

import Ember from 'ember';
import TableController from '../table';
import ColumnDefinition from 'em-table/utils/column-definition';

var MoreObject = more.Object;

export default TableController.extend({

  perf1 : Ember.computed('timelinemodel.query1' , function () {
    return this.get("timelinemodel.query1").get('details.perf');
  }),
  perf2 : Ember.computed('timelinemodel.query2' , function () {
    return this.get("timelinemodel.query2").get('details.perf');
  }),
  columns: ColumnDefinition.make([{
    id: 'perfLogName',
    headerTitle: 'Raw Perf Log Name',
    contentPath: 'perfLogName',
  }, {
    id: 'perfLogValue',
    headerTitle: 'Value',
    contentPath: 'perfLogValue',
    cellDefinition: {
      type: 'duration'
    }
  }]),

  rows: Ember.computed("perf", function () {
    var perf = this.get("perf"),
        rows = [];

    if(perf) {
      MoreObject.forEach(perf, function (key, value) {
        rows.push(Ember.Object.create({
          perfLogName: key,
          perfLogValue: value
        }));
      });
    }

    return Ember.A(rows);
  })

});
