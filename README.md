A web app to show instantaneous quotation of 3-D Models using a powerful tool CuraEngine.

Install Curaengine on your server side.

Steps to install Curaengine:-

1. Clone the repository from https://github.com/Ultimaker/CuraEngine.git (the URL at the right hand side of this page).

2. Install Protobuf >= 3.0.0 (see below)

3. Install libArcus (see https://github.com/Ultimaker/libArcus)

In order to compile CuraEngine, either use CMake or start a project in your preferred IDE. CMake compilation:

1. Navigate to the CuraEngine directory and execute the following commands
2. $ mkdir build && cd build
3. $ cmake ..
4. $ make

Project files generation:

1. Navigate to the CuraEngine directory and execute the following commands
2. cmake . -G "CodeBlocks - Unix Makefiles"
3. (for a list of supported IDE's see         http://www.cmake.org/Wiki/CMake_Generator_Specific_Information#Code::Blocks_Generator)


Installing Protobuf

1. Be sure to have libtool installed.
2. Download protobuf from https://github.com/google/protobuf/releases (download ZIP and unZIP at desired location, or clone the repo). The protocol buffer is used for communication between the CuraEngine and the GUI.

3. Run autogen.sh from the protobuf directory: $ ./autogen.sh

4. $ ./configure

5. $ make

6. # make install
(Please note the #. It indicates the need of superuser, as known as root, priviliges.)

7. (In case the shared library cannot be loaded, you can try sudo ldconfig on Linux systems)