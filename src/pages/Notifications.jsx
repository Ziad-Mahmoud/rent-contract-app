import React, { useState, useEffect } from 'react';
import { createEntity } from "../api/entityFactory";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, addDays, isBefore } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Trash2,
  RefreshCw,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [notificationsData, contractsData] = await Promise.all([
      createEntity("notification").list('-created_date'),
      createEntity("contract").list(),
    ]);
    setNotifications(notificationsData);
    setContracts(contractsData);
    setLoading(false);
  };

  const generateNotifications = async () => {
    setGenerating(true);
    const today = new Date();
    const thirtyDaysLater = addDays(today, 30);
    const tenDaysLater = addDays(today, 10);

    // Find contracts ending soon
    const expiringContracts = contracts.filter(c => {
      const endDate = new Date(c.end_date);
      return c.status === 'ساري' && endDate >= today && endDate <= thirtyDaysLater;
    });

    // Create notifications for expiring contracts
    for (const contract of expiringContracts) {
      // Check if notification already exists
      const exists = notifications.find(n => 
        n.contract_id === contract.id && 
        n.type === 'contract_expiry'
      );

      if (!exists) {
        const endDate = new Date(contract.end_date);
        const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        
        await createEntity("notification").create({
          title: `عقد ينتهي قريباً`,
          message: `العقد رقم ${contract.contract_number || contract.id.slice(0, 8)} سينتهي خلال ${daysRemaining} يوم`,
          type: 'contract_expiry',
          contract_id: contract.id,
          due_date: contract.end_date,
          is_read: false,
        });
      }
    }

    // Create payment reminders
    const activeContracts = contracts.filter(c => c.status === 'ساري');
    for (const contract of activeContracts) {
      const paymentDay = contract.payment_day || 1;
      const currentDate = today.getDate();
      
      // If payment day is within next 5 days
      if (paymentDay >= currentDate && paymentDay <= currentDate + 5) {
        const exists = notifications.find(n => 
          n.contract_id === contract.id && 
          n.type === 'payment_due' &&
          new Date(n.created_date).getMonth() === today.getMonth()
        );

        if (!exists) {
          await createEntity("notification").create({
            title: `تذكير بموعد السداد`,
            message: `موعد سداد إيجار العقد رقم ${contract.contract_number || contract.id.slice(0, 8)} يوم ${paymentDay} من هذا الشهر`,
            type: 'payment_due',
            contract_id: contract.id,
            due_date: new Date(today.getFullYear(), today.getMonth(), paymentDay).toISOString(),
            is_read: false,
          });
        }
      }
    }

    setGenerating(false);
    loadData();
  };

  const markAsRead = async (notification) => {
    await createEntity("notification").update(notification.id, { is_read: true });
    loadData();
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await createEntity("notification").update(n.id, { is_read: true });
    }
    loadData();
  };

  const deleteAllRead = async () => {
    const read = notifications.filter(n => n.is_read);
    for (const n of read) {
      await createEntity("notification").delete(n.id);
    }
    setDeleteDialogOpen(false);
    loadData();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'contract_expiry': return AlertTriangle;
      case 'payment_due': return Calendar;
      default: return Bell;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'contract_expiry': return 'text-amber-500 bg-amber-100';
      case 'payment_due': return 'text-blue-500 bg-blue-100';
      default: return 'text-slate-500 bg-slate-100';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Bell className="h-8 w-8 text-[#1e3a5f]" />
            الإشعارات
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {unreadCount} جديد
              </Badge>
            )}
          </h1>
          <p className="text-slate-500 mt-1">إشعارات انتهاء العقود ومواعيد السداد</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={generateNotifications}
            disabled={generating}
          >
            <RefreshCw className={cn("h-4 w-4 ml-2", generating && "animate-spin")} />
            تحديث الإشعارات
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={markAllAsRead}
            >
              <Check className="h-4 w-4 ml-2" />
              تحديد الكل كمقروء
            </Button>
          )}
          {notifications.filter(n => n.is_read).length > 0 && (
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              حذف المقروءة
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Bell className="h-16 w-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              لا توجد إشعارات
            </h3>
            <p className="text-slate-500 mb-4">
              اضغط على "تحديث الإشعارات" لإنشاء إشعارات جديدة
            </p>
            <Button
              onClick={generateNotifications}
              className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8a]"
              disabled={generating}
            >
              <RefreshCw className={cn("h-4 w-4 ml-2", generating && "animate-spin")} />
              تحديث الإشعارات
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <Card
                key={notification.id}
                className={cn(
                  "border-0 shadow-lg transition-all",
                  !notification.is_read && "ring-2 ring-[#1e3a5f]/20"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", colorClass)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {notification.title}
                            {!notification.is_read && (
                              <Badge className="mr-2 bg-[#1e3a5f]">جديد</Badge>
                            )}
                          </h3>
                          <p className="text-slate-600 mt-1">{notification.message}</p>
                          {notification.due_date && (
                            <p className="text-sm text-slate-500 mt-2">
                              التاريخ: {format(new Date(notification.due_date), 'dd MMMM yyyy', { locale: ar })}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {notification.contract_id && (
                            <Link to={createPageUrl('Contracts') + `?id=${notification.contract_id}`}>
                              <Button variant="outline" size="sm">
                                عرض العقد
                              </Button>
                            </Link>
                          )}
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsRead(notification)}
                            >
                              <CheckCircle className="h-5 w-5 text-emerald-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {format(new Date(notification.created_date), 'dd MMM yyyy - hh:mm a', { locale: ar })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الإشعارات المقروءة</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف جميع الإشعارات المقروءة. هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAllRead}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}