# BaoHe

CLI tool for personal cloud storage services.

BaoHe (宝盒) is pronounced as `bǎo hé` in Chinese.

## Usage

    # install
    $ npm install -g baohe

    # add pan.baidu.com service
    # will prompt to input username and password, if it is the first time to use
    $ baohe use baidu

    # list service which is in use
    $ baohe current

    # list all the supported services
    $ baohe all

    # list all the files stored on cloud
    $ baohe ls

    # list current directory on cloud
    $ baohe pwd

    # change current directory on cloud
    $ baohe cd target_dir

    # copy local files to current directory on cloud
    $ baohe cp local_file_a local_file_b

    # copy local files to specific directory on cloud
    $ baohe cp --to target_dir local_file_a local_file_b

## License

  MIT
