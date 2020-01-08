pragma solidity ^0.5.0;

contract MediaPlatform{

    uint public mediaTotal = 0;
    mapping(uint => Media) public mediaMap;

    struct Media{
        uint id;
        string title;
        string mediaHash;
        uint tipAmount;
        address payable owner;
    }

    event MediaCreated(
        uint id,
        string title,
        string mediaHash,
        uint tipAmount,
        address payable owner
    );

    event MediaTipped(
        uint id,
        string title,
        string mediaHash,
        uint tipAmount,
        address payable owner
    );

    function createMedia(string memory _title, string memory _mediaHash) public {
        require(bytes(_title).length>0,"Title cannot be empty!!");
        require(bytes(_mediaHash).length>0,"No Media Provided");

        mediaTotal++;
        mediaMap[mediaTotal] = Media(mediaTotal, _title, _mediaHash, 0, msg.sender);
        emit MediaCreated(mediaTotal, _title, _mediaHash, 0, msg.sender);
    }

    function tipMedia(uint _id) public payable{
        require(_id>0 && _id<=mediaTotal,"ID invalid");
        Media memory _media = mediaMap[_id];
        address payable _owner = _media.owner;
        address(_owner).transfer(msg.value);
        _media.tipAmount = _media.tipAmount + msg.value;
        mediaMap[_id] = _media;
        emit MediaTipped(_id,_media.title,_media.mediaHash,_media.tipAmount, _owner);
    }
}