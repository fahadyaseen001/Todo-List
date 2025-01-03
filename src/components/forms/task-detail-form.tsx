"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar, Edit2, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from "@/components/ui/card";
import { useUpdateTaskForm } from "@/hooks/use-update-task";
import { formatDate } from "../dashboard/dashboard-utils/date-format";
import { convertTo24Hour } from "../dashboard/dashboard-utils/time-format";
import Loader from "../pages/loader";

const TaskDetailForm = () => {
  const params = useParams();
  const taskId = params?.id as string || '';
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  const {
    formData,
    errors,
    isLoading,
    isFormValid,
    handleInputChange,
    handleSubmit,
    setFormData
  } = useUpdateTaskForm();

  useEffect(() => {
    if (taskId) {
      sessionStorage.setItem('taskId', taskId);
    }
  }, [taskId]);

  useEffect(() => {
    const loadTaskData = async () => {
      const taskData = sessionStorage.getItem(`task-${taskId}`);
      if (taskData) {
        try {
          const parsedData = JSON.parse(taskData);
          const newFormData = {
            ...formData,
            ...parsedData,
            status: parsedData.status?.toString() || '',
            priority: parsedData.priority?.toString() || '',
          };
          setFormData(newFormData);
          setInitialDataLoaded(true);
        } catch (error) {
          console.error('Error parsing task data:', error);
        }
      }
    };

    loadTaskData();
  }, [taskId]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
    setIsEditMode(false);
  };

  if (!initialDataLoaded) {
    return <div className="w-full max-w-4xl mx-auto p-6">Loading...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent>
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-2xl font-bold">Task Details</div>
            <Button
              type="button"
              variant={isEditMode ? "destructive" : "default"}
              onClick={() => setIsEditMode(!isEditMode)}
              className="w-24"
            >
              {isEditMode ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </>
              )}
            </Button>
          </div>

          {/* First Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter task title"
                disabled={!isEditMode || isLoading}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
                disabled={!isEditMode || isLoading}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {['High', 'Medium', 'Low'].map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority}</p>
              )}
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="h-24"
                placeholder="Enter task description"
                disabled={!isEditMode || isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-sm font-medium">
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={!isEditMode || isLoading}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      formatDate(formData.dueDate)
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const localDate = new Date(date.setHours(12, 0, 0, 0));
                        const userTimezoneOffset = localDate.getTimezoneOffset() * 60000;
                        const adjustedDate = new Date(localDate.getTime() - userTimezoneOffset);
                        handleInputChange('dueDate', adjustedDate.toISOString());
                      } else {
                        handleInputChange('dueDate', '');
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-3 gap-6">



          <div className="space-y-2">
              <Label htmlFor="dueTime" className="text-sm font-medium">
                Due Time
              </Label>
              <div className="flex items-center space-x-2">
              <Input
              type="time"
              id="dueTime"
              value={formData.dueTime ? convertTo24Hour(formData.dueTime) : ''}
              onChange={(e) => handleInputChange('dueTime', e.target.value)}
              className={`flex-1 ${
                !formData.dueTime
                  ? 'text-gray-400' // For both light and dark modes, empty input text is gray
                  : 'text-black dark:text-white' // In light mode, filled input text is black; in dark mode, filled input text is white
              }`}
              disabled={!isEditMode || isLoading}
               />

              </div>
              {errors.dueTime && (
                <p className="text-sm text-red-500">{errors.dueTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
                disabled={!isEditMode || isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {['Completed', 'In Progress', 'Todo', 'BackLog', 'Cancelled'].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status}</p>
              )}
            </div>

            <div className="flex justify-end items-end">
              {isEditMode && (
                <Button
                  type="submit"
                  variant="default"
                  className="w-50"
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? (
                    <>
                  <Loader /> 
                      Updating Task...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskDetailForm;