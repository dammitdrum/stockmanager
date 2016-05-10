<?php
require "scss.inc.php";
$scss = new scssc();
$scss->setFormatter("scss_formatter");
$server = new scss_server("css", null, $scss);
$server->serve();
?>