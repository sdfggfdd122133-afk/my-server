#include <iostream>
#include <string>

using namespace std;

class ServerMonitor {
private:
    string serverName;
    string status;
    int activeUsers;
    int responseTime;

public:
    ServerMonitor(string name, string stat, int users, int time) {
        serverName = name;
        status = stat;
        activeUsers = users;
        responseTime = time;
    }

    void displayReport() {
        cout << "========================================" << endl;
        cout << "        IDBA SERVER STATUS REPORT       " << endl;
        cout << "========================================" << endl;
        cout << " Server Name   : " << serverName << endl;
        cout << " Status        : " << status << endl;
        cout << " Active Users  : " << activeUsers << " Users" << endl;
        cout << " Response Time : " << responseTime << " ms" << endl;
        cout << "========================================" << endl;
        cout << " System Status Summary: OPERATIONAL OK" << endl;
        cout << "========================================" << endl;
    }
};

int main() {
    ServerMonitor myServer("IDBA-Main-Server", "Active (Pulse Running)", 1248, 24);
    myServer.displayReport();
    return 0;
}
