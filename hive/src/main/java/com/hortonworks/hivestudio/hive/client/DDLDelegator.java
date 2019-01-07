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


package com.hortonworks.hivestudio.hive.client;

import java.util.List;

import com.hortonworks.hivestudio.common.dto.DumpInfo;
import com.hortonworks.hivestudio.common.dto.WarehouseDumpInfo;
import com.hortonworks.hivestudio.hive.internal.dto.DatabaseInfo;
import com.hortonworks.hivestudio.hive.internal.dto.TableInfo;

public interface DDLDelegator {

  void killQueries(ConnectionConfig config, String killQueriesStatement);

  List<DatabaseInfo> getDbList(ConnectionConfig config, String like);

  DumpInfo createBootstrapDumpForDB(ConnectionConfig config, String databaseName);

  DumpInfo createIncrementalDumpForDB(ConnectionConfig config, String databaseName, Integer lastReplicationId);

  WarehouseDumpInfo createWarehouseBootstrapDump(ConnectionConfig config);

  WarehouseDumpInfo createWarehouseIncrementalDump(ConnectionConfig config, Integer lastReplicationId, Integer maxNumberOfEvents);

  List<TableInfo> getTableList(ConnectionConfig config, String database, String like);

  List<Row> getTableDescriptionFormatted(ConnectionConfig config, String database, String table);

  List<Row> getTableCreateStatement(ConnectionConfig config, String database, String table);

  List<ColumnDescription> getTableDescription(ConnectionConfig config, String database, String table, String like, boolean extended);

  Cursor<Row, ColumnDescription> getDbListCursor(ConnectionConfig config, String like);

  Cursor<Row, ColumnDescription> getTableListCursor(ConnectionConfig config, String database, String like);

  Cursor<Row, ColumnDescription> getTableDescriptionCursor(ConnectionConfig config, String database, String table, String like, boolean extended);

  DatabaseMetadataWrapper getDatabaseMetadata(ConnectionConfig config);
}
