# sc2-xml-to-json
Node service which converts SC2 XML balance data exported from map editor to JSON format for further processing.

This is designed to be an Azure Function app triggered from a storage queue.

1. User manually exports balance data, zips the contents and uploads to the blob container and adds message to the xml queue.
2. The new message to the XML queue triggers this function.
3. Gets target blob name from queue message
4. Downloads desired blob to local file
5. Unzips contents to local directory
6. Reads all .xml files in directory and parses each file to JSON
7. Groups generic units into weapongs, buildings, and units
8. Uploads to json blob container
9. Sends message to json queue to notify next job in sequence. 