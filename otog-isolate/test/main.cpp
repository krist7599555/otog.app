#include <iostream>
#include <fstream>
#include <stdexcept>
using namespace std;

int main()
{
    uint a, b;
    std::cin >> a >> b;
    // throw std::invalid_argument("received negative value");
    std::cout << a << " + " << b << " = " << (a + b) << std::endl;
    if (a == 777)
    {
        exit(1);
    }
    // std::ofstream myfile;
    // myfile.open("example.txt");
    // myfile << "Writing this to a file.\n";
    // myfile.close();
}